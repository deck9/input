const colors = require("tailwindcss/colors");

function withOpacityValue(variable) {
    return ({ opacityValue }) => {
      if (opacityValue === undefined) {
        return `rgb(var(${variable}))`
      }
      return `rgba(var(${variable}), ${opacityValue})`
    }
  }

module.exports = {
    darkMode: "class",

    important: '.ipt',

    content: [
        "./node_modules/@deck9/ui/dist/src/index.es.js",
        "./node_modules/smooth-dnd/dist/index.js",
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./vendor/laravel/jetstream/**/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.vue",
        "./resources/js/**/*.ts",
    ],

    theme: {
        extend: {
            colors: {
                gray: null,
                slate: null,
                grey: colors.slate,
                primary: withOpacityValue('--color-primary'),
                contrast: withOpacityValue('--color-contrast'),
            },
            borderColor: {
                DEFAULT: colors.slate[300],
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
