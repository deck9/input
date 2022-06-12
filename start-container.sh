#!/usr/bin/env sh

# Migrate the database
/usr/bin/php /var/www/html/artisan migrate --force

# Start Supervisor
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

exec "$@"
