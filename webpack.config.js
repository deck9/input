// @ts-nocheck
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");
const VueI18nPlugin = require('@intlify/unplugin-vue-i18n/webpack')

module.exports = {
    resolve: {
        alias: {
            "@": path.resolve("resources/js"),
            "@i18n": path.resolve("resources/locales"),
            "@css": path.resolve("resources/css"),
            "ziggy": path.resolve('vendor/tightenco/ziggy/dist')
        },
    },
    plugins: [
        VueI18nPlugin({
        include: path.resolve(__dirname, './resources/locales/**'),
      }),
      new ESLintPlugin()],
};
