SHELL=/bin/bash
baseDir := $(shell pwd)
userRights := $(shell id -u):$(shell id -g)

up:
	docker run --rm -u "$(userRights)" -v "$(baseDir):/var/www/html" -w "/var/www/html" laravelsail/php81-composer:latest composer install --ignore-platform-reqs
	./vendor/bin/sail up -d
	npm ci
	@echo "Run dev build of assets"
	npm run dev
	./vendor/bin/sail artisan migrate
	./vendor/bin/sail artisan key:generate
	@echo "Application is up and running http://localhost:8500"
