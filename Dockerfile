ARG APP_PATH=/opt/input

FROM node:16-alpine as asset_builder
ARG APP_PATH
WORKDIR $APP_PATH
ENV NODE_ENV production

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run production
RUN rm -rf node_modules

# ---

FROM trafex/php-nginx as web

USER root

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

RUN sed -i "s/var\/www\/html/var\/www\/html\/public/g" /etc/nginx/nginx.conf

USER nobody
WORKDIR /var/www/html

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --chown=nobody --from=asset_builder /opt/input/ /var/www/html

RUN composer install --optimize-autoloader --no-interaction --no-progress

# Remove Composer Cache & Script since we do not need it any more
USER root
RUN rm -rf /root/.composer /usr/bin/composer
USER nobody


# Set DEFAULT ENV for app

ENV APP_URL=http://localhost:8080
ENV DB_CONNECTION=sqlite
ENV SESSION_DRIVER=file
ENV CACHE_DRIVER=file
ENV LOG_CHANNEL=stderr
ENV MAIL_MAILER=log

RUN touch /var/www/html/storage/database.sqlite
RUN php artisan migrate --force

RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

RUN echo "APP_KEY=" > .env
RUN php artisan key:generate
