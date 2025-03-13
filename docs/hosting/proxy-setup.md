# Proxy Setup / TLS

When self-hosting Input, you may want to use your own domain and add TLS encryption. This can be achieved by setting up a reverse proxy. Here's how to configure it:

## Docker Configuration

When running the Input container, make sure to set the `APP_URL` environment variable to your domain:

```bash
docker run -d -p 8080:8080 --name input \
    -v input-data:/var/www/html/storage \
    -e APP_URL=https://your-domain.com \
    ghcr.io/deck9/input:main
```

## Nginx Configuration

If you're using Nginx as your reverse proxy, use the following configuration:

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

This configuration ensures that important request information like the scheme, host, and IP are passed to Input.

## SSL/TLS Configuration

To enable HTTPS:

1. Obtain an SSL certificate for your domain (e.g., using Let's Encrypt).
2. Configure your reverse proxy to use the SSL certificate.
3. Ensure all traffic is redirected from HTTP to HTTPS.

Remember to adjust your firewall settings to allow traffic on port 443 for HTTPS.

By following these steps, you can run Input on your own domain with secure HTTPS access.
