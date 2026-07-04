FROM python:3.13-slim

WORKDIR /workspace

# Install system dependencies needed for building certain python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy application source code
COPY . .

# Install dependencies using pip
RUN pip install --no-cache-dir .

# Expose port
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/workspace
ENV PORT=8000

# Command to run migrations and start the application
CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
