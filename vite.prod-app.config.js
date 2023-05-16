import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { webpackStats } from 'rollup-plugin-webpack-stats';

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
        }),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        webpackStats()
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
            "@i18n": "/resources/locales",
            "@css": "/resources/css",
        }
    }
});
