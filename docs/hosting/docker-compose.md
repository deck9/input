# Docker Compose for Production

The image runs on its own with SQLite and local files. This setup adds MariaDB, Redis for cache and sessions, and S3 storage with [RustFS](https://github.com/rustfs/rustfs). Mail goes out through your SMTP server.

## Configuration

Create a `.env` file next to your `docker-compose.yml` and adjust the values:

```dotEnv
APP_KEY=base64:your_generated_key
APP_URL=https://your-domain.com

QUEUE_CONNECTION=sync
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
MINIO_ACCESS_KEY_ID=your_s3_access_key
MINIO_SECRET_ACCESS_KEY=your_s3_secret_key
MINIO_DEFAULT_REGION=us-east-1
MINIO_BUCKET=input
MINIO_ENDPOINT=http://rustfs:9000
MINIO_USE_PATH_STYLE_ENDPOINT=true

MAIL_MAILER=smtp
MAIL_HOST=your_smtp_host
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=forms@your-domain.com
MAIL_FROM_NAME=Input
```

`FILESYSTEM_DRIVER=minio` works with any S3-compatible storage. To use AWS S3 or another provider instead of RustFS, point `MINIO_ENDPOINT` to it and leave out the `rustfs` service below.

See [Configuration](/hosting/configuration) for the database, the queue worker and mail.

## Docker Compose YAML

Create a `docker-compose.yml` file:

```yaml
services:
  input:
    image: ghcr.io/deck9/input:main
    container_name: input
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
      rustfs:
        condition: service_started
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
      - MARIADB_DATABASE=${DB_DATABASE}
      - MARIADB_USER=${DB_USERNAME}
      - MARIADB_PASSWORD=${DB_PASSWORD}
      - MARIADB_RANDOM_ROOT_PASSWORD=1
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "healthcheck.sh", "--connect", "--innodb_initialized"]
      interval: 5s
      retries: 10
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: input-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    restart: unless-stopped

  rustfs:
    image: rustfs/rustfs:1.0.1
    container_name: input-rustfs
    environment:
      - RUSTFS_VOLUMES=/data
      - RUSTFS_ACCESS_KEY=${MINIO_ACCESS_KEY_ID}
      - RUSTFS_SECRET_KEY=${MINIO_SECRET_ACCESS_KEY}
    volumes:
      - rustfs-data:/data
    restart: unless-stopped

volumes:
  input-data:
  mysql-data:
  redis-data:
  rustfs-data:
```

The app waits for the database to be healthy, because the container runs the migrations on start.

## Usage

1. Generate an `APP_KEY` with `echo "base64:$(openssl rand -base64 32)"` and add it to your `.env` file.
2. Start all services:

```bash
docker compose up -d
```

3. Create the storage bucket once:

```bash
docker compose exec -e HOME=/tmp input php artisan tinker --execute='Storage::disk("minio")->getClient()->createBucket(["Bucket" => config("filesystems.disks.minio.bucket")])'
```

4. Put a reverse proxy with TLS in front of port 8080, see [Proxy Setup / TLS](/hosting/proxy-setup).
