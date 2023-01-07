/// <reference types="vitest" />
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['tests/vitest.setup.ts'],
    },
    plugins: [
        laravel({
            input: [
                "resources/js/app.ts",
                "resources/js/forms/classic.ts"
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            "@i18n": "/resources/locales",
            "@css": "/resources/css",
        }
    }
});
