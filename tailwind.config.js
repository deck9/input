const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");

module.exports = {
    mode: "jit",
    purge: [
        "./node_modules/@deck9/ui/dist/src/index.es.js",
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./vendor/laravel/jetstream/**/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.vue",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter var experimental",
                    "Inter var",
                    ...defaultTheme.fontFamily.sans,
                ],
            },
            colors: {
                grey: colors.blueGray,
            },
            keyframes: {
                spinner: {
                    "0%, 70%, 100%": { transform: "scale3D(1,1,1);" },
                    "35%": { transform: "scale3D(0,0,1);" },
                },
            },
            animation: {
                spinner: "spinner 1.3s ease-in-out infinite",
            },
        },
    },

    plugins: [
        require("@tailwindcss/forms"),
        require("@tailwindcss/typography"),
    ],
};
