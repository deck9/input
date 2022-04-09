SHELL=/bin/bash
baseDir := $(shell pwd)
userRights := $(shell id -u):$(shell id -g)

up:
	docker run --rm -u "$(userRights)" -v "$(baseDir):/var/www/html" -w "/var/www/html" laravelsail/php81-composer:latest composer install --ignore-platform-reqs
	./vendor/bin/sail up -d
	./vendor/bin/sail artisan migrate
	./vendor/bin/sail artisan key:generate
	npm ci
	npm run dev
	@echo "Application is up and running http://localhost:8500"
