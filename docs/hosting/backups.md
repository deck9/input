# Backups and Updates

## What to Back Up

1. Your settings: the `.env` file or your `docker run` command. Keep `APP_KEY` safe. With a new key, everyone is logged out, and users with two-factor login can't sign in.
2. The database.
3. Uploaded files and images.

Redis holds only the cache, sessions and queued jobs. It needs no backup.

## Single Container (SQLite)

With the default setup, the database and uploads live in the storage volume. Stop the container for a moment so the database file is complete, archive the volume, and start it again:

```bash
docker stop input
docker run --rm --volumes-from input -v "$PWD":/backup alpine tar czf /backup/input-storage.tar.gz -C /var/www/html storage
docker start input
```

To restore, stop the container and unpack the archive into the volume:

```bash
docker stop input
docker run --rm --volumes-from input -v "$PWD":/backup alpine sh -c "rm -rf /var/www/html/storage/* && tar xzf /backup/input-storage.tar.gz -C /var/www/html"
docker start input
```

## Docker Compose (MariaDB and RustFS)

For the [Docker Compose setup](/hosting/docker-compose), dump the database:

```bash
docker compose exec db sh -c 'mariadb-dump --single-transaction -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' > input.sql
```

To restore it:

```bash
docker compose exec -T db sh -c 'mariadb -u"$MARIADB_USER" -p"$MARIADB_PASSWORD" "$MARIADB_DATABASE"' < input.sql
```

Uploaded files are in the RustFS volume. Archive it while RustFS is stopped:

```bash
docker compose stop rustfs
docker run --rm --volumes-from input-rustfs -v "$PWD":/backup alpine tar czf /backup/input-rustfs.tar.gz -C / data
docker compose start rustfs
```

To restore it:

```bash
docker compose stop rustfs
docker run --rm --volumes-from input-rustfs -v "$PWD":/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/input-rustfs.tar.gz -C /"
docker compose start rustfs
```

With an external database or S3 provider, use its backup tools.

## Updates

Back up first. Then pull the new image and recreate the containers:

```bash
docker compose pull
docker compose up -d
```

For a single container, run `docker pull ghcr.io/deck9/input:main`, remove the old container with `docker rm -f input`, and start it again with the same `docker run` command. Your data stays in the volume.

The container runs the database migrations on start.
