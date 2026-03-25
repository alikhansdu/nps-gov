"""seed_regions

Revision ID: 8874841b2131
Revises: 2ea9260f00d3
Create Date: 2026-03-21 15:51:03.734860

"""
from alembic import op
import sqlalchemy as sa


revision = '8874841b2131'
down_revision = '2ea9260f00d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.bulk_insert(
        sa.table(
            'regions',
            sa.column('name', sa.String),
            sa.column('code', sa.String),
        ),
        [
            {"name": "Алматы",         "code": "ALM"},
            {"name": "Астана",          "code": "AST"},
            {"name": "Шымкент",         "code": "SHY"},
            {"name": "Алматинская",     "code": "ALM-OBL"},
            {"name": "Акмолинская",     "code": "AKM"},
            {"name": "Актюбинская",     "code": "AKT"},
            {"name": "Атырауская",      "code": "ATY"},
            {"name": "ВКО",             "code": "VKO"},
            {"name": "Жамбылская",      "code": "ZHA"},
            {"name": "ЗКО",             "code": "ZKO"},
            {"name": "Карагандинская",  "code": "KAR"},
            {"name": "Костанайская",    "code": "KUS"},
            {"name": "Кызылординская",  "code": "KZY"},
            {"name": "Мангистауская",   "code": "MAN"},
            {"name": "Павлодарская",    "code": "PAV"},
            {"name": "СКО",             "code": "SKO"},
            {"name": "Туркестанская",   "code": "TUR"},
        ]
    )


def downgrade() -> None:
    op.execute("DELETE FROM regions")