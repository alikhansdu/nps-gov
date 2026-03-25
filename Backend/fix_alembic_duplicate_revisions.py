from __future__ import annotations

import argparse
import ast
import hashlib
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


REVISION_RE = re.compile(r"^[a-zA-Z0-9_]+$")


@dataclass(frozen=True)
class RevisionInfo:
    path: Path
    revision: str | None
    down_revision: str | tuple[str, ...] | None
    depends_on: str | tuple[str, ...] | None


def _iter_version_files(versions_dir: Path) -> list[Path]:
    files = sorted(p for p in versions_dir.glob("*.py") if p.is_file())
    return [p for p in files if p.name != "__init__.py"]


def _ast_literal(node: ast.AST) -> Any:
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, (ast.Tuple, ast.List)):
        items = tuple(_ast_literal(elt) for elt in node.elts)
        return items
    return None


def _read_revision_info(path: Path) -> RevisionInfo:
    src = path.read_text(encoding="utf-8")
    tree = ast.parse(src, filename=str(path))

    revision = None
    down_revision = None
    depends_on = None

    for node in tree.body:
        if not isinstance(node, ast.Assign) or len(node.targets) != 1:
            continue
        target = node.targets[0]
        if not isinstance(target, ast.Name):
            continue
        name = target.id
        value = _ast_literal(node.value)
        if name == "revision" and isinstance(value, str):
            revision = value
        elif name == "down_revision":
            if value is None or isinstance(value, str):
                down_revision = value
            elif isinstance(value, tuple) and all(isinstance(v, str) for v in value):
                down_revision = value  # type: ignore[assignment]
        elif name == "depends_on":
            if value is None or isinstance(value, str):
                depends_on = value
            elif isinstance(value, tuple) and all(isinstance(v, str) for v in value):
                depends_on = value  # type: ignore[assignment]

    return RevisionInfo(path=path, revision=revision, down_revision=down_revision, depends_on=depends_on)


def _normalize_versions_dir(p: str) -> Path:
    # Allow passing "Backend/alembic/versions" while running from Backend/.
    path = Path(p).expanduser()
    if path.is_dir():
        return path

    cwd = Path.cwd()

    # fallback 1: interpret as relative to current working directory
    try_alt = cwd / p
    if try_alt.is_dir():
        return try_alt

    # fallback 2: if running from ".../Backend" and user passed "Backend/..."
    parts = Path(p).parts
    if parts and parts[0].lower() == "backend" and cwd.name.lower() == "backend":
        stripped = cwd.joinpath(*parts[1:])
        if stripped.is_dir():
            return stripped

    raise SystemExit(f"Versions directory not found: {p}")


def _compute_new_revision(old: str, file_path: Path, used: set[str], salt: str) -> str:
    # Keep it deterministic and readable. Alembic revisions are typically hex, but any
    # stable identifier works as long as it's unique and referenced consistently.
    base = old if REVISION_RE.match(old or "") else "rev"
    h = hashlib.sha1((salt + str(file_path)).encode("utf-8")).hexdigest()[:8]
    cand = f"{base}_{h}"
    i = 2
    while cand in used:
        cand = f"{base}_{h}_{i}"
        i += 1
    return cand


def _replace_assignment(src: str, var: str, new_value_repr: str) -> str:
    # Replace a simple "var = ..." assignment line at module top level.
    # We keep formatting simple and avoid touching anything else.
    pattern = re.compile(rf"^(?P<indent>\s*){re.escape(var)}\s*=\s*.*$", re.MULTILINE)
    if not pattern.search(src):
        return src
    return pattern.sub(rf"\g<indent>{var} = {new_value_repr}", src, count=1)


def _rewrite_refs_in_assignment(src: str, var: str, mapping: dict[str, str]) -> str:
    # For down_revision / depends_on, rewrite occurrences inside quotes in that line.
    # Works for: 'abc', "abc", ('a', 'b'), ("a", "b")
    line_pat = re.compile(rf"^(?P<indent>\s*){re.escape(var)}\s*=\s*(?P<rhs>.*)$", re.MULTILINE)
    m = line_pat.search(src)
    if not m:
        return src

    rhs = m.group("rhs")

    def repl(match: re.Match[str]) -> str:
        quote = match.group("q")
        val = match.group("v")
        if val in mapping:
            return f"{quote}{mapping[val]}{quote}"
        return match.group(0)

    rhs2 = re.sub(r"(?P<q>['\"])(?P<v>[^'\"]+)(?P=q)", repl, rhs)
    if rhs2 == rhs:
        return src
    new_line = f"{m.group('indent')}{var} = {rhs2}"
    return src[: m.start()] + new_line + src[m.end() :]


def _maybe_rename_file(path: Path, new_revision: str, dry_run: bool) -> Path:
    # If filename already starts with a revision-ish prefix, rewrite it.
    # We support both "<rev>_*.py" and "<rev>.py".
    stem = path.stem
    m = re.match(r"^(?P<rev>[a-zA-Z0-9_]+)(?P<rest>_.*)?$", stem)
    if not m:
        return path
    rest = m.group("rest") or ""
    new_name = f"{new_revision}{rest}{path.suffix}"
    if new_name == path.name:
        return path
    new_path = path.with_name(new_name)
    if dry_run:
        return new_path
    path.rename(new_path)
    return new_path


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Fix duplicate Alembic revision identifiers by rewriting revision + references."
    )
    parser.add_argument("--versions", required=True, help="Path to alembic/versions directory")
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without writing files")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Actually write changes (by default only reports; combine with/without --dry-run).",
    )
    parser.add_argument("--rename-files", action="store_true", help="Also rename revision files to match new revision")
    parser.add_argument(
        "--salt",
        default="fix_alembic_duplicate_revisions",
        help="Salt used when generating new revision ids (for deterministic output)",
    )

    args = parser.parse_args(argv)
    versions_dir = _normalize_versions_dir(args.versions)
    files = _iter_version_files(versions_dir)
    if not files:
        print(f"No migration files found in: {versions_dir}")
        return 0

    infos = [_read_revision_info(p) for p in files]
    missing = [i.path for i in infos if not i.revision]
    if missing:
        print("Some migration files are missing a `revision` variable:")
        for p in missing:
            print(f" - {p}")
        return 2

    by_rev: dict[str, list[RevisionInfo]] = {}
    for info in infos:
        by_rev.setdefault(info.revision or "", []).append(info)

    dup_groups = {rev: group for rev, group in by_rev.items() if len(group) > 1}
    if not dup_groups:
        print("OK: no duplicate `revision` identifiers found.")
        return 0

    used_revisions = {i.revision for i in infos if i.revision}
    rewrite_map: dict[str, dict[Path, str]] = {}  # old_rev -> {file_path -> new_rev}
    global_mapping: dict[str, str] = {}  # old_rev(for duplicates) -> chosen replacement for a given file won't fit; used for refs.

    # Plan: keep the first file (stable order), rewrite others.
    for old_rev, group in sorted(dup_groups.items(), key=lambda x: x[0]):
        group_sorted = sorted(group, key=lambda i: str(i.path).lower())
        keep = group_sorted[0]
        print(f"Duplicate revision '{old_rev}':")
        print(f" - keep:   {keep.path.name}")
        rewrite_map[old_rev] = {}

        for dup in group_sorted[1:]:
            new_rev = _compute_new_revision(old_rev, dup.path, used_revisions, args.salt)
            used_revisions.add(new_rev)
            rewrite_map[old_rev][dup.path] = new_rev
            print(f" - change: {dup.path.name} -> revision '{new_rev}'")

    # Apply per-file mapping and update references in all files.
    # Note: references are ambiguous when there were duplicates; we only update references
    # that point to specific rewritten files via the old revision id by rewriting to the
    # *new* revision of that file when possible.
    #
    # Practically, if there were duplicates, a graph is already broken; we assume the
    # intended references were to the kept one unless the referencing file is in the rewritten set.
    #
    # For safety, we only rewrite refs where we can be confident:
    # - In the rewritten file itself: rewrite its own revision assignment
    # - In files whose down_revision/depends_on matches an old_rev and that old_rev was duplicated:
    #   we leave it unchanged (kept) and print a warning, unless the referencing file is also being rewritten
    #   (then we can map via its own file rewrite choice).

    dry = args.dry_run or not args.apply
    if dry:
        print("\nPlanned changes (dry-run):")
    else:
        print("\nApplying changes:")

    # 1) Rewrite `revision` in the duplicate files
    path_remap: dict[Path, Path] = {}
    for old_rev, per_file in rewrite_map.items():
        for file_path, new_rev in per_file.items():
            src = file_path.read_text(encoding="utf-8")
            src2 = _replace_assignment(src, "revision", repr(new_rev))
            if src2 == src:
                print(f" - WARN: could not rewrite revision in {file_path}")
            else:
                print(f" - {file_path.name}: set revision = {new_rev!r}")
                if not dry:
                    file_path.write_text(src2, encoding="utf-8")
            if args.rename_files:
                new_path = _maybe_rename_file(file_path, new_rev, dry_run=dry)
                if new_path != file_path:
                    print(f" - {file_path.name}: rename -> {new_path.name}")
                    path_remap[file_path] = new_path

    # If renames are planned/applied, update our list of files for reference rewrites.
    if path_remap:
        files = [path_remap.get(p, p) for p in files]

    # 2) Rewrite references in down_revision/depends_on where unambiguous:
    # Only update references that point to a rewritten file AND the referencing file is that rewritten file.
    # Additionally, rewrite references inside rewritten files from old_rev -> keep(old_rev) stays same,
    # but if rewritten file previously referenced one of the duplicated revisions, we warn.
    rewritten_files_to_newrev: dict[Path, str] = {}
    for per_file in rewrite_map.values():
        for p, new_rev in per_file.items():
            rewritten_files_to_newrev[path_remap.get(p, p)] = new_rev

    # Build a simple mapping old_rev -> kept rev (same string), plus per-file mapping is not representable globally.
    duplicated_old_revs = set(rewrite_map.keys())

    for p in files:
        src = p.read_text(encoding="utf-8")
        src2 = src

        # For rewritten files, if they had down_revision/depends_on matching a duplicated old_rev,
        # we cannot safely infer which duplicate they meant; keep as-is and warn.
        if p in rewritten_files_to_newrev:
            for var in ("down_revision", "depends_on"):
                m = re.search(rf"^\s*{var}\s*=\s*(?P<rhs>.*)$", src2, flags=re.MULTILINE)
                if m and any(old in m.group("rhs") for old in duplicated_old_revs):
                    print(f" - WARN: {p.name} {var} references a duplicated revision; left unchanged.")

        # If this file itself was rewritten from old_rev to new_rev, references to its own old_rev should become new_rev
        # (rare, but safe).
        for old_rev, per_file in rewrite_map.items():
            if p in rewritten_files_to_newrev:
                # No-op unless the file contains a self-reference.
                new_rev = rewritten_files_to_newrev[p]
                src2 = _rewrite_refs_in_assignment(src2, "down_revision", {old_rev: new_rev})
                src2 = _rewrite_refs_in_assignment(src2, "depends_on", {old_rev: new_rev})

        if src2 != src:
            print(f" - {p.name}: updated references")
            if not dry:
                p.write_text(src2, encoding="utf-8")

    print("\nDone.")
    if dry and not args.apply:
        print("Note: changes were not written. Re-run with --apply to write files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

