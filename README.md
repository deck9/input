<p align="center">   
<img height="60" src="public/images/input-with-bg.png">
</p>
<p align="center">
<i>Input is a no-code application to create simple & clean forms.<br> With our customization options, you can let the forms shine in your brands colors.</i>
<img style="max-width:800px" src="public/images/product-screenshot.png">
</p>

## Why Input?

Input aims to be an alternative to proven tools like TypeForm, with the added benefit of self-hosting and having brandable forms out of the box.

We started Input out of a previous project called BotReach, which was already a conversational form tool, but closed-source. We plan to release a feature complete first MVP of Input in Q2 2022.

> We are in an early stage of developing and some of our planned features are currently not in the codebase. You can contact us via philipp@deck9.co to get on the waitlist or if you want to contribute to the development.

## Development

We are using [Laravel Sail](https://laravel.com/docs/master/sail) to develop Input. You need Docker already installed on your machine to run the entire app. We also recommend installing Node.JS and NPM directly on your host machine to make working with frontend assets more convenient.

-   [Docker](https://www.docker.com/get-started/)
-   [NodeJS](https://nodejs.org/) (v16 LTS preferred)

### Download

Clone the source of this repository with the following command:

```bash
git clone git@github.com:deck9/input.git
```

### Configuration

Copy the `.env.dev.example` file to `.env` - the contents for the file should, in most cases, work out of the box. You may later generate and set the `APP_KEY` with the `sail artisan key:generate` command.

```bash
cp .env.dev.example .env
```

### Running

Make sure that your Docker agent is running. There are several steps necessary to build the app for the first time. To simplify these tasks, we have a Makefile in place. Just run the following command, and all build steps will run automatically:

```bash
make up
```

### Webpack (Mix)

To compile the frontend assets, we use Laravel Mix. You can use watch mode to rerun Webpack each time a file changes.
We also have a hot-reload enabled mode. Please note that this mode currently has a bug since we have defined multiple entry files for Webpack.

```bash
npm run dev
# or
npm run dev # hot reload enabled
```

### Sail Bash Alias

It is recommended to create a bash alias, to make working with Laravel Sail simple as possible. To do this, you can check out the [Laravel docs](https://laravel.com/docs/9.x/sail#configuring-a-bash-alias) on this topic or just add the following alias to your `.bashrc` or `.zshrc`:

```bash
alias sail='[ -f sail ] && bash sail || bash vendor/bin/sail'
```

With the alias, you can quickly perform tasks on the App Docker Container:

```bash
sail up -d # start container
sail artisan tinker # use laravel artisan commands
sail artisan migrate # run database migrations
sail artisan test # run phpunit
sail composer {args} # use composer
```

## Production Deployment

### Quick Start

Please copy the `.env.example` file from this repository and fill in the missing values. To generate your `APP_KEY` you can use the following command in your terminal:

```bash
echo -n 'base64:'; openssl rand -base64 32
```

Save the generated key in the `.env` file and run the following commands to start the container:

```bash
# Create Docker Volume
docker volume create input-data
```

```bash
# Run the container using port 8080 on the host
docker run -d -p 8080:8080 --name input \
 -v input-data:/var/www/html/storage \
 --env-file .env \
 ghcr.io/deck9/input:main

```

### Docker Compose

You can also use Docker Compose to run the application. Please copy the `.env.example` file from this repository and fill in the missing values. To generate your `APP_KEY` you can use the following command in your terminal:

```bash
echo -n 'base64:'; openssl rand -base64 32
```

```docker-compose
version: '3.2'
services:
    input:
      image: ghcr.io/deck9/input:main
      volumes:
        - input-data:/var/www/html/storage
      ports:
        - 8080:8080
      restart: unless-stopped
      environment:
        - APP_URL="https://<hostname>:8080"
        - APP_KEY="<your-app-key>"
        - DB_CONNECTION="sqlite"
        - SESSION_DRIVER="file"
        - CACHE_DRIVER="file"

volumes:
  input-data:
```

### Behind a Proxy

Make sure to set the `APP_URL` env to the domain you want to use for your proxy.

Also make sure that the proxy is configured to pass forward important request information like the scheme, host and IP.

```nginx
location / {
    proxy_set_header Connection "";
    proxy_set_header Host $http_host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Frame-Options SAMEORIGIN;
    proxy_http_version 1.1;

    # Pass the request to the address of the docker container
    proxy_pass http://127.0.0.1:8080;
}
```

### With MySQL

To use MySQL as database, you need to set the following environment variables in your `.env` file:

```dotEnv
# Database Config
DB_CONNECTION=mysql
DB_DATABASE=input
DB_HOST=<MySQL-Host>
DB_USERNAME=<MySQL-User>
DB_PASSWORD=<MySQL-Password>
```
