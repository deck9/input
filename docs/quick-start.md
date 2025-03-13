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

2. Run the Input container:

```bash
docker run -d -p 8080:8080 --name input \
-v input-data:/var/www/html/storage \
-e APP_URL=https://your-domain.com:8080 \
ghcr.io/deck9/input:main
```

3. Access Input at http://localhost:8080

### Using Docker Compose

1. Create a docker-compose.yml file:

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
      - APP_URL="https://your-domain.com:8080"

volumes:
  input-data:
```

2. Run the contrainer:

```bash
docker compose up -d
```

3. Access Input at http://localhost:8080

For advanced setups (MySQL, email configuration), see our [Advanced Configuration Guide](/docker-advanced-configuration).
