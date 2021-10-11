export default {
    root: true,
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        'plugin:@typescript-eslint/recommended',
        "@vue/typescript/recommended",
        "@vue/prettier",
        "@vue/prettier/@typescript-eslint",
    ],
    parserOptions: {
        ecmaVersion: 2020,
        parser: "@typescript-eslint/parser",
    },
    plugins: [
        '@typescript-eslint',
      ],
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    },
};
