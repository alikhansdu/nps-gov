from __future__ import annotations
from logging.config import fileConfig
from alembic import context
from sqlalchemy import create_engine, pool
from app.core.database import Base
from app.models import models  # noqa: F401

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name, encoding="utf-8")

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    context.configure(
        url="postgresql+psycopg2://postgres:postgres@localhost:5432/nps_gov",
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    import psycopg2
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        dbname="nps_gov",
        user="postgres",
        password="postgres",
    )
    from sqlalchemy import event
    from sqlalchemy.pool import StaticPool
    engine = create_engine(
        "postgresql+psycopg2://",
        creator=lambda: conn,
        poolclass=StaticPool,
    )
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction():
            context.run_migrations()
    conn.close()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()