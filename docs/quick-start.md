# Getting Started with Input

There are two ways to start using Input: self-hosting or using our hosted version. Let's explore both options.

## Option 1: Using the Hosted Version

If you prefer a hassle-free setup, you can use our hosted version of Input. This option is ideal for users who want to get started quickly without managing their own infrastructure.

1. Visit our website at [https://app.getinput.co/register](https://app.getinput.co/register)
2. Complete the registration process
3. Log in to your new Input account and start creating forms!

::: info What to know about the hosted version

1. The hosted version is a paid service. For pricing details, please visit our [pricing page](https://getinput.co/#managed-or-self-hosted).
2. The server is provided by Hetzner, a German cloud provider.
3. The servers are located in Nürnberg, Germany.
4. The hosted version is always up-to-date with the latest version of Input.
:::

## Option 2: Self-Hosting Input

For users who prefer complete control over their data and infrastructure, self-hosting Input is an excellent option. Here's how to get started:

### Prerequisites

Before you begin, make sure you have the following installed:

- [Docker](https://www.docker.com/get-started/)
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, but recommended)

### Quick Start with Docker

1. Create a Docker volume for persistent storage:

```bash
docker volume create input-data
```

2. Generate an app key. Input does not work without one:

```bash
echo "base64:$(openssl rand -base64 32)"
```

3. Run the Input container with your key:

```bash
docker run -d -p 8080:8080 --name input \
-v input-data:/var/www/html/storage \
-e APP_URL=http://localhost:8080 \
-e APP_KEY=base64:your_generated_key \
ghcr.io/deck9/input:main
```

4. Open Input at `http://localhost:8080`

### Using Docker Compose

1. Generate an app key as shown above, then create a docker-compose.yml file:

```yaml
version: "3.2"
services:
  input:
    image: ghcr.io/deck9/input:main
    container_name: input
    hostname: your-hostname
    volumes:
      - input-data:/var/www/html/storage
    ports:
      - 8080:8080
    restart: unless-stopped
    environment:
      - APP_URL=http://localhost:8080
      - APP_KEY=base64:your_generated_key

volumes:
  input-data:
```

2. Run the container:

```bash
docker compose up -d
```

3. Open Input at `http://localhost:8080`

To run Input on your own domain, set `APP_URL` to that domain and see [Proxy Setup / TLS](/hosting/proxy-setup). For production setups with MariaDB, Redis and S3 storage, see our [Docker Compose for Production](/hosting/docker-compose) guide. [Configuration](/hosting/configuration) covers the database, the queue worker and mail, and [Backups and Updates](/hosting/backups) what to back up.

## Getting Started After Installation

Once you have Input up and running, follow these steps to create your first form:

### Initial Setup

1. **Create an account**: Register with your email and password
2. **Create a team**: Input organizes forms by teams, so you'll need to create one
3. **Dashboard access**: After logging in, you'll see the dashboard where you can manage all your forms

![Input Dashboard](/assets/dashboard.png)

### Creating Your First Form

1. Click the "Create Form" button on the dashboard
2. Give your form a name and description
3. Use the intuitive drag-and-drop builder to add form blocks
4. Configure each block with questions, options, and settings
5. Preview your form to ensure it looks and works as expected
6. Publish your form when it's ready to share

![Multiple Choice Example](/assets/multiplechoice.gif)
_Example: Adding a multiple choice question to your form_

## Troubleshooting Common Issues

### Installation Problems

- **Container not starting**: Check Docker logs with `docker logs input`
- **Cannot access Input**: Verify the port mapping in your Docker configuration
- **Database errors**: Ensure volume permissions are set correctly

### Form Creation Issues

- **Changes not saving**: Refresh the page and try again
- **Upload errors**: Check file size limits and permissions
- **Preview not working**: Clear browser cache and cookies

Need more help? Check our documentation or reach out to our community forum.
