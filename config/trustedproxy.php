<?php

return [
    // Read by Laravel's TrustProxies: a comma list of IPs or CIDR ranges, or * for any proxy.
    'proxies' => env('TRUSTED_PROXIES') ?: '*',
];
