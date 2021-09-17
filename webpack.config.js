const ESLintPlugin = require("eslint-webpack-plugin");
const path = require("path");

module.exports = {
    resolve: {
        alias: {
            "@": path.resolve("resources/js"),
        },
    },
    plugins: [new ESLintPlugin()],
};
