FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir httpx
COPY ./app ./app
COPY main.py .
COPY alembic.ini .
COPY alembic ./alembic
COPY entrypoint-migrate.sh .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]