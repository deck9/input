FROM trafex/php-nginx as php_base

LABEL Maintainer="Philipp Reinking <philipp@deck9.co>" Description="Input is a no-code application to create simple & clean forms."
LABEL org.opencontainers.image.licenses="Business Source License 1.1"

USER root

# Set DEFAULT ENV for app
ENV APP_URL=http://localhost:8080
ENV DB_CONNECTION=sqlite
ENV SESSION_DRIVER=file
ENV CACHE_DRIVER=file
ENV LOG_CHANNEL=stderr
ENV MAIL_MAILER=log

RUN apk add --no-cache \
    php81-exif \
    php81-fileinfo \
    php81-iconv \
    php81-simplexml \
    php81-tokenizer \
    php81-xmlwriter \
    php81-redis \
    php81-pdo \
    php81-pdo_mysql \
    php81-pdo_sqlite \
    php81-bcmath \
    sqlite

COPY nginx.conf /etc/nginx/nginx.conf

USER nobody
WORKDIR /var/www/html

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --chown=nobody . .

RUN composer install --optimize-autoloader --no-interaction --no-progress

# Remove Composer Cache & Script since we do not need it any more
USER root
RUN rm -rf /root/.composer /usr/bin/composer
USER nobody

# ---

FROM node:16-alpine as asset_builder
WORKDIR /var/www/html
ENV NODE_ENV production

COPY --from=php_base /var/www/html ./
RUN npm ci && npm cache clean --force

RUN npm run production
RUN rm -rf node_modules

# ---

FROM php_base as final_image
WORKDIR /var/www/html

COPY --from=asset_builder /var/www/html/public/js ./public/js
COPY --from=asset_builder /var/www/html/public/mix-manifest.json ./public/mix-manifest.json

RUN touch /var/www/html/storage/database.sqlite
RUN php artisan migrate --force

RUN php artisan route:cache
RUN php artisan view:cache
RUN php artisan storage:link

RUN echo "APP_KEY=" > .env
RUN php artisan key:generate

USER root
COPY --chown=nobody:nobody ./start-container.sh /opt/input/start-container.sh
RUN chmod +x /opt/input/start-container.sh
USER nobody

ENTRYPOINT [ "/opt/input/start-container.sh" ]
