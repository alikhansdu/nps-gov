from alembic import op
import sqlalchemy as sa

revision = '20260415_impl_status_decisions'
down_revision = '20260325_reset_all'
branch_labels = None
depends_on = None


def upgrade():
    # ── 1. Enum: implementation_status ─────────────────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'implementation_status') THEN
                CREATE TYPE implementation_status AS ENUM ('pending', 'in_progress', 'implemented', 'rejected');
            END IF;
        END$$;
    """)

    # ── 2. Колонка surveys.implementation_status ────────────────────────────────
    op.execute("""
        ALTER TABLE surveys
        ADD COLUMN IF NOT EXISTS implementation_status implementation_status
            NOT NULL DEFAULT 'pending';
    """)

    # ── 3. Enum: decision_status ────────────────────────────────────────────────
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'decision_status') THEN
                CREATE TYPE decision_status AS ENUM ('implemented', 'in_progress');
            END IF;
        END$$;
    """)

    # ── 4. Таблица decisions ────────────────────────────────────────────────────
    op.execute("""
        CREATE TABLE IF NOT EXISTS decisions (
            id          SERIAL PRIMARY KEY,
            title       VARCHAR(500) NOT NULL,
            description TEXT,
            status      decision_status NOT NULL DEFAULT 'in_progress',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            survey_id   INTEGER REFERENCES surveys(id) ON DELETE SET NULL
        );
    """)


def downgrade():
    op.execute("DROP TABLE IF EXISTS decisions;")
    op.execute("DROP TYPE IF EXISTS decision_status;")
    op.execute("ALTER TABLE surveys DROP COLUMN IF EXISTS implementation_status;")
    op.execute("DROP TYPE IF EXISTS implementation_status;")
