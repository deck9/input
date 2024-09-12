#!/usr/bin/env sh

# Migrate the database
/usr/bin/php /var/www/html/artisan migrate --force

# Clear the cache
/usr/bin/php /var/www/html/artisan optimize:clear

# Optimize the cache
/usr/bin/php /var/www/html/artisan optimize

# Start Supervisor
/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf

exec "$@"
