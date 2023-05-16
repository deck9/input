import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import { webpackStats } from 'rollup-plugin-webpack-stats';

export default defineConfig({
    plugins: [
        laravel({
            input: "resources/js/forms/classic.ts",
            refresh: true,
            buildDirectory: 'js',
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        cssInjectedByJsPlugin(),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        webpackStats()
    ],
    build: {
        modulePreload: false,
        cssCodeSplit: false,
        rollupOptions: {
            output:{
                manualChunks: undefined,
                entryFileNames: '[name].js',
            }
        }
    },
    resolve: {
        alias: {
            '@': '/resources/js',
            "@i18n": "/resources/locales",
            "@css": "/resources/css",
        }
    }
});
