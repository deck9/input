FROM trafex/php-nginx:3.3.0 as php_base

LABEL Maintainer="Philipp Reinking <philipp@deck9.co>" Description="Input is a no-code application to create simple & clean forms."
LABEL org.opencontainers.image.licenses="GNU Affero General Public License v3.0"

USER root

# Set DEFAULT ENV for app
ENV APP_URL=http://localhost:8080
ENV DB_CONNECTION=sqlite
ENV SESSION_DRIVER=file
ENV CACHE_DRIVER=file
ENV LOG_CHANNEL=stderr
ENV MAIL_MAILER=log

RUN apk add --no-cache \
    php82-exif \
    php82-fileinfo \
    php82-iconv \
    php82-simplexml \
    php82-tokenizer \
    php82-xmlwriter \
    php82-redis \
    php82-pdo \
    php82-pdo_mysql \
    php82-pdo_sqlite \
    php82-bcmath \
    sqlite

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY php.conf.ini /etc/php82/conf.d/99-input.ini

USER nobody
WORKDIR /var/www/html

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --chown=nobody . .

RUN composer install --optimize-autoloader --no-interaction --no-progress

USER root

# Remove Composer Cache & Script since we do not need it any more
RUN rm -rf /root/.composer /usr/bin/composer

# Copy Supervisor Config for Scheduler
COPY scheduler.conf /tmp/scheduler.conf
RUN cat /tmp/scheduler.conf >> /etc/supervisor/conf.d/supervisord.conf && rm -f /tmp/scheduler.conf

USER nobody

# ---

FROM node:18-alpine as asset_builder
WORKDIR /var/www/html
ENV NODE_ENV production

COPY --from=php_base /var/www/html ./
RUN npm ci && npm cache clean --force

RUN npm run build
RUN rm -rf node_modules

# ---

FROM php_base as final_image
WORKDIR /var/www/html

COPY --from=asset_builder /var/www/html/public/build ./public/build
COPY --from=asset_builder /var/www/html/public/js ./public/js

RUN touch /var/www/html/storage/database.sqlite
RUN php artisan migrate --force

RUN php artisan storage:link

RUN echo "APP_KEY=" > .env
RUN php artisan key:generate

# Generate the API Documentation
RUN php artisan scribe:generate --env doc

RUN php artisan route:cache
RUN php artisan view:cache

USER root
COPY --chown=nobody:nobody ./start-container.sh /opt/input/start-container.sh
RUN chmod +x /opt/input/start-container.sh
USER nobody

ENTRYPOINT [ "/opt/input/start-container.sh" ]
