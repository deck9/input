# Configuration

Input reads its settings from environment variables. Pass them with `-e` or `--env-file` to `docker run`, or put them in the `.env` file of your [Docker Compose setup](/hosting/docker-compose). The full list is in [`.env.example`](https://github.com/deck9/input/blob/main/.env.example).

## Database

Input supports SQLite and MariaDB or MySQL.

By default, the image uses SQLite. The database file is `database.sqlite` in the storage volume, so it needs no extra setup.

To use MariaDB or MySQL:

```dotEnv
DB_CONNECTION=mysql
DB_HOST=your_db_host
DB_PORT=3306
DB_DATABASE=input
DB_USERNAME=input_user
DB_PASSWORD=your_secure_password
```

The container runs the database migrations on every start. After an update, there is nothing else to run.

## Queue Worker

Webhooks, submission notification mails and form preview images run as jobs.

With `QUEUE_CONNECTION=sync` (the default), each job runs right away, inside the request that starts it. This needs no extra setup.

To run jobs in the background, set `QUEUE_CONNECTION=redis` and start a queue worker. The image does not run a worker by itself. Add a second service with the same image to your `docker-compose.yml`:

```yaml
  worker:
    image: ghcr.io/deck9/input:main
    container_name: input-worker
    depends_on:
      - input
    env_file: .env
    entrypoint: ["php", "/var/www/html/artisan", "queue:work"]
    volumes:
      - input-data:/var/www/html/storage
    # the image's health check pings the web server, which the worker doesn't run
    healthcheck:
      disable: true
    restart: unless-stopped
```

::: warning
With `QUEUE_CONNECTION=redis` and no worker, webhooks and notification mails are never sent.
:::

Failed jobs are stored in the `failed_jobs` table. To retry them:

```bash
docker compose exec input php artisan queue:retry all
```

## Scheduler

The image runs the Laravel scheduler every minute, for example to delete old submissions when a form has auto-delete turned on. You don't need a cron job.

## Mail

Input sends mail for team invitations, password resets and submission notifications.

The image sets `MAIL_MAILER=log`. Mails are not sent. They are written to the container log instead. Without a mail server, you can still find an invitation link there:

```bash
docker logs input
```

To send mail, use your SMTP server:

```dotEnv
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_smtp_username
MAIL_PASSWORD=your_smtp_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=forms@your-domain.com
MAIL_FROM_NAME=Input
```

Set `MAIL_FROM_ADDRESS` to an address your SMTP server may send from. Many servers reject other senders.
