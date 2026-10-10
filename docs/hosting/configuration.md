# Configuration

Input reads its settings from environment variables. Pass them with `-e` or `--env-file` to `docker run`, or put them in the `.env` file of your [Docker Compose setup](/hosting/docker-compose). The common ones are in [`.env.example`](https://github.com/deck9/input/blob/main/.env.example).

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

Webhooks and submission notification mails run as jobs.

The image runs a queue worker next to the scheduler, so jobs run in the background and a submit doesn't wait for them. You don't need a separate worker container.

With `QUEUE_CONNECTION=database` (the default in the image), jobs wait in your database until the worker picks them up. This needs no extra setup. If you run Redis, as in the [Docker Compose setup](/hosting/docker-compose), `QUEUE_CONNECTION=redis` works too.

With `QUEUE_CONNECTION=sync`, each job runs inside the request that starts it: a slow webhook receiver makes the submit wait, and a failed webhook is not tried again.

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
