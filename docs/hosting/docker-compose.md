# Docker Compose for Production

While the default Docker container uses SQLite, which is not suitable for production, a robust setup requires additional services. Here's how to set up a production-ready environment using Docker Compose:

## Required Services

1. Database (MariaDB)
2. S3-compatible object storage (MinIO)
3. Redis for caching and sessions
4. External mailer service

## Configuration

1. Create a `.env` file in the same directory as your `docker-compose.yml` file.
2. Add the following content to your `.env` file, adjusting the values as needed:

```dotEnv
APP_KEY=your_app_key
APP_URL=https://your-domain.com

QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
CACHE_DRIVER=redis

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=input
DB_USERNAME=input_user
DB_PASSWORD=your_secure_password

REDIS_HOST=redis
REDIS_PASSWORD=your_redis_password
REDIS_PORT=6379

FILESYSTEM_DRIVER=minio
MINIO_ACCESS_KEY_ID=your_minio_access_key
MINIO_SECRET_ACCESS_KEY=your_minio_secret_key
MINIO_DEFAULT_REGION=us-east-1
MINIO_BUCKET=input-bucket
MINIO_URL=http://minio:9000
MINIO_ENDPOINT=http://minio:9000
MINIO_USE_PATH_STYLE_ENDPOINT=true

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
```

## Docker Compose YAML

Create a docker-compose.yml file with the following content:

```yaml
version: "3.2"

services:
  input:
    image: ghcr.io/deck9/input:main
    container_name: input
    depends_on:
      - db
      - redis
      - minio
    env_file: .env
    volumes:
      - input-data:/var/www/html/storage
    ports:
      - "8080:8080"
    restart: unless-stopped

  db:
    image: mariadb:10
    container_name: input-db
    environment:
      - MYSQL_DATABASE=${DB_DATABASE}
      - MYSQL_USER=${DB_USERNAME}
      - MYSQL_PASSWORD=${DB_PASSWORD}
      - MYSQL_ROOT_PASSWORD=your_root_password
    volumes:
      - mysql-data:/var/lib/mysql
    restart: unless-stopped

  redis:
    image: redis:6.2-alpine
    container_name: input-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    restart: unless-stopped

  minio:
    image: minio/minio
    container_name: input-minio
    environment:
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY_ID}
      - MINIO_SECRET_KEY=${MINIO_SECRET_ACCESS_KEY}
    volumes:
      - minio-data:/data
    command: server /data
    restart: unless-stopped

volumes:
  input-data:
  mysql-data:
  redis-data:
  minio-data:
```

### Usage

1. Create the .env file with your configuration.
2. Create the docker-compose.yml file as shown above.
3. Generate an APP_KEY using Laravel's key generation command and add it to your .env file.
4. Run docker compose up -d to start all services.
