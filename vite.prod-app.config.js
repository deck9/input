import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/app.ts",
            refresh: true,
            buildDirectory: 'build/app',
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        })
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            "@i18n": "/resources/locales",
            "@css": "/resources/css",
        }
    }
});
