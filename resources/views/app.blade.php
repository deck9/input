<!DOCTYPE html>
<html class="ipt" lang="{{ str_replace('_', '-', app()->getLocale()) }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Input') }}</title>

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png">
        <link rel="manifest" href="/icons/site.webmanifest">
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ef4444">
        <link rel="shortcut icon" href="/icons/favicon.ico">
        <meta name="msapplication-TileColor" content="#202020">
        <meta name="msapplication-config" content="/icons/browserconfig.xml">
        <meta name="theme-color" content="#202020">

        <!-- Google / Search Engine Tags -->
        <meta itemprop="name" content="{{ $ogProperties['title'] ?? config('app.name', 'Input')}}">
        <meta itemprop="description"
              content="{{ $ogProperties['description'] ?? 'The survey tool, that lets you create outstanding conversational survey experiences in just a few minutes.'}}">
        <meta itemprop="image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}">

        <!-- Facebook Meta Tags -->
        <meta property="og:title" content="{{ $ogProperties['title'] ?? config('app.name', 'Input')}}">
        <meta property="og:type" content="website">
        <meta property="og:description"
              content="{{ $ogProperties['description'] ?? 'The survey tool, that lets you create outstanding conversational survey experiences in just a few minutes.'}}">
        <meta property="og:image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}">

        <!-- Twitter Meta Tags -->
        <meta name="twitter:title" content="{{ $ogProperties['title'] ?? config('app.name', 'Input')}}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:description"
              content="{{ $ogProperties['description'] ?? 'The survey tool, that lets you create outstanding conversational survey experiences in just a few minutes.'}}">
        <meta name="twitter:image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}">

        <!-- Scripts -->
        @routes
        @vite('resources/js/app.js')
    </head>

    <body class="font-sans antialiased">
        @inertia
    </body>

</html>
