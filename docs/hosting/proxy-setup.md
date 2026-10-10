# Proxy Setup / TLS

When self-hosting Input, you may want to use your own domain and add TLS encryption. This can be achieved by setting up a reverse proxy. Here's how to configure it:

## Docker Configuration

When running the Input container, make sure to set the `APP_URL` environment variable to your domain. `APP_KEY` is required too, see the [Quick Start](/quick-start) for how to generate it:

```bash
docker run -d -p 8080:8080 --name input \
    -v input-data:/var/www/html/storage \
    -e APP_URL=https://your-domain.com \
    -e APP_KEY=base64:your_generated_key \
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
    proxy_http_version 1.1;

    # Pass the request to the address of the docker container
    proxy_pass http://127.0.0.1:8080;
}
```

This configuration ensures that important request information like the scheme, host, and IP are passed to Input.

## Caddy Configuration

Caddy gets a TLS certificate for your domain and passes the host, scheme and IP headers by itself:

```text
your-domain.com {
    reverse_proxy 127.0.0.1:8080
}
```

## Allowed Host and Trusted Proxies

Input only answers requests for the host in `APP_URL` and its subdomains. Any other host gets a `400 Bad Request`. Make sure `APP_URL` is your public URL and that your proxy passes the original `Host` header (like `proxy_set_header Host $http_host;` above) or sets `X-Forwarded-Host`. Health checks that go through the app must use that host too.

By default, Input trusts the `X-Forwarded-*` headers from any proxy. To trust only your proxy, add `TRUSTED_PROXIES` to the `docker run` command above, with the proxy's IPs or CIDR ranges, comma-separated:

```bash
-e TRUSTED_PROXIES=172.16.0.0/12
```

With Docker Compose, put `TRUSTED_PROXIES=172.16.0.0/12` in your `.env` file instead.

## SSL/TLS Configuration

To enable HTTPS:

1. Obtain an SSL certificate for your domain (e.g., using Let's Encrypt).
2. Configure your reverse proxy to use the SSL certificate.
3. Ensure all traffic is redirected from HTTP to HTTPS.

Remember to adjust your firewall settings to allow traffic on port 443 for HTTPS.

By following these steps, you can run Input on your own domain with secure HTTPS access.
