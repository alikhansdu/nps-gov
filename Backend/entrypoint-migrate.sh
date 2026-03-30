#!/bin/bash
set -e

echo "Waiting for database..."
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$POSTGRES_DB'" | grep -q 1 || \
PGPASSWORD=$POSTGRES_PASSWORD psql -h postgres -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB"

echo "Running migrations..."
alembic upgrade head
echo "Migrations done."