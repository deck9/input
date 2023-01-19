<!DOCTYPE html>
<html class="ipt" lang="{{ str_replace('_', '-', app()->getLocale()) }}">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ $ogProperties['title'] ?? config('app.name', 'Input')}}</title>

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
        {{-- <meta itemprop="image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}"> --}}

        <!-- Facebook Meta Tags -->
        <meta property="og:title" content="{{ $ogProperties['title'] ?? config('app.name', 'Input')}}">
        <meta property="og:type" content="website">
        <meta property="og:description"
              content="{{ $ogProperties['description'] ?? 'The survey tool, that lets you create outstanding conversational survey experiences in just a few minutes.'}}">
        {{-- <meta property="og:image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}"> --}}

        <!-- Twitter Meta Tags -->
        <meta name="twitter:title" content="{{ $ogProperties['title'] ?? config('app.name', 'Input')}}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:description"
              content="{{ $ogProperties['description'] ?? 'The survey tool, that lets you create outstanding conversational survey experiences in just a few minutes.'}}">
        {{-- <meta name="twitter:image" content="{{ $ogProperties['image'] ?? '/images/meta-image.png'}}"> --}}

        <!-- Scripts -->
        <script lang="js">
            {!! $form->getJavascriptConfig() !!}
        </script>

        @vite('resources/js/forms/classic.ts', 'js')

        <style>
            *,
            ::before,
            ::after {
                box-sizing: border-box;
                border-width: 0;
                border-style: solid;
            }

            ::before,
            ::after {
                --tw-content: '';
            }

            html {
                height: 100%;
            }

            body {
                margin: 0;
                line-height: inherit;
                height: 100%;
            }
        </style>
    </head>

    <body class="font-sans antialiased ">

        @auth
        @if(!$form->is_published && auth()->user()->id === $form->user_id)
        <div class="bg-orange-600 py-2 absolute inset-x-0 top-0 px-4">
            <div class="max-w-screen-lg mx-auto text-orange-50 text-sm flex justify-center">
                <span class="font-bold">You are viewing a preview of your form.</span>
            </div>
        </div>
        @endif
        @endauth

        <div style="
            @if($form->background)
                background-image: url('{{ $form->background }}?w=1920&fm=webp');
                background-image: -webkit-image-set(
                    url('{{ $form->background }}?w=1600&fm=webp') 1x,
                    url('{{ $form->background }}?w=2880&fm=webp') 2x
                );
                background-image: image-set(
                    url('{{ $form->background }}?w=1600&fm=webp') 1x,
                    url('{{ $form->background }}?w=2880&fm=webp') 2x
                );
            @endif
            @if($form->background_color)
                background-color: {{ $form->background_color }};
            @endif
            @if($flags['spacing'])
                padding-top: {{ $flags['spacing'] }}px;
            @endif" class="
                min-h-full pb-4 md:pb-6 flex w-full bg-cover
                {{ $flags['spacing'] ? '' : 'pt-10 md:pt-20'}}
                {{ $flags['iframe'] ? 'px-2' : 'px-4 md:px-0' }}
            ">
            <div class="w-full" id="input-classic">
                @include('_loading')
            </div>
        </div>

    </body>

</html>
