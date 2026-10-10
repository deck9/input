# Packages are plain PHP files: fetch them once, natively, for every platform
FROM --platform=$BUILDPLATFORM mirror.gcr.io/library/composer AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader --no-interaction --no-progress --ignore-platform-reqs

# ---

FROM mirror.gcr.io/trafex/php-nginx:3.6.0 AS php_base

LABEL Maintainer="Philipp Reinking <philipp@deck9.co>" Description="Input is a no-code application to create simple & clean forms."
LABEL org.opencontainers.image.licenses="GNU Affero General Public License v3.0"

USER root

# Set DEFAULT ENV for app
ENV APP_URL=http://localhost:8080
ENV DB_CONNECTION=sqlite
ENV SESSION_DRIVER=file
ENV CACHE_DRIVER=file
ENV QUEUE_CONNECTION=database
ENV LOG_CHANNEL=stderr
ENV MAIL_MAILER=log

RUN apk add --no-cache \
    php83-exif \
    php83-fileinfo \
    php83-iconv \
    php83-simplexml \
    php83-tokenizer \
    php83-xmlwriter \
    php83-redis \
    php83-pdo \
    php83-pdo_mysql \
    php83-pdo_sqlite \
    php83-bcmath \
    sqlite

COPY ./scripts/nginx/fastcgi_params /etc/nginx/fastcgi_params
COPY ./scripts/nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./scripts/nginx/nginx.default.conf /etc/nginx/conf.d/default.conf
COPY ./scripts/php.conf.ini /etc/php83/conf.d/99-input.ini

USER nobody
WORKDIR /var/www/html

COPY --from=mirror.gcr.io/library/composer /usr/bin/composer /usr/bin/composer
COPY --chown=nobody . .
COPY --chown=nobody --from=vendor /app/vendor ./vendor

RUN composer install --optimize-autoloader --no-interaction --no-progress

USER root

# Remove Composer Cache & Script since we do not need it any more
RUN rm -rf /root/.composer /usr/bin/composer

# Copy Supervisor Config for Scheduler and Queue Worker
COPY ./scripts/scheduler.conf ./scripts/queue-worker.conf /tmp/
RUN cat /tmp/scheduler.conf /tmp/queue-worker.conf >> /etc/supervisor/conf.d/supervisord.conf && rm -f /tmp/scheduler.conf /tmp/queue-worker.conf

USER nobody

# ---

# Built JS and CSS are the same for every platform: build them once, natively
FROM --platform=$BUILDPLATFORM mirror.gcr.io/library/node:18-alpine AS asset_builder
WORKDIR /var/www/html
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY . .
# Tailwind scans Blade views in vendor/ for class names
COPY --from=vendor /app/vendor ./vendor
RUN npm run build
RUN rm -rf node_modules

# ---

FROM php_base AS final_image
WORKDIR /var/www/html

COPY --from=asset_builder /var/www/html/public/build ./public/build
COPY --from=asset_builder /var/www/html/public/js ./public/js

RUN touch /var/www/html/storage/database.sqlite
RUN php artisan migrate --force

RUN php artisan storage:link

# Generate the API Documentation
RUN php artisan scribe:generate --env doc

USER root
COPY --chown=nobody:nobody ./scripts/start-container.sh /opt/input/start-container.sh
RUN chmod +x /opt/input/start-container.sh
USER nobody

ENTRYPOINT [ "/opt/input/start-container.sh" ]
