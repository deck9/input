# Backups and Updates

## What to Back Up

1. Your settings: the `.env` file or your `docker run` command. Keep `APP_KEY` safe: answers are stored encrypted with it. Back it up with the database, and never change it on a running install. With a new key, saved answers can't be read, everyone is logged out, and users with two-factor login can't sign in.
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

## Forms of Deleted Teams

Before v2.2, deleting a team left its forms behind. They stayed online, kept taking answers nobody could see, and their files stayed on disk. If you deleted a team before updating to v2.2, clean them up once after the update.

First list them. This deletes nothing:

```bash
docker compose exec input php artisan input:prune-orphaned-forms
```

It shows each form with its ID, name, and number of submissions and uploaded files. Forms in the trash are included. Back up first, then delete them:

```bash
docker compose exec input php artisan input:prune-orphaned-forms --force
```

This deletes the forms for good, with their submissions, logic rules, uploaded files and images. An image that another form still uses stays. For a single container, use `docker exec input` instead of `docker compose exec input`.
