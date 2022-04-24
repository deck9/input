// @ts-nocheck
const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");

module.exports = {
    resolve: {
        alias: {
            "@": path.resolve("resources/js"),
            "@css": path.resolve("resources/css"),
            "ziggy": path.resolve('vendor/tightenco/ziggy/dist')
        },
    },
    plugins: [new ESLintPlugin()],
};
