#!/bin/bash
set -e

echo "Waiting for database..."
alembic upgrade head
echo "Migrations done."