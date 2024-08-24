import "floating-vue/dist/style.css";
import "@css/app.css";
import { createApp, h } from "vue";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createInertiaApp } from "@inertiajs/vue3";
import { createPinia } from "pinia";
import { PiniaDebounce } from "@pinia/plugin-debounce";
import { createI18n } from "vue-i18n";
import FloatingVue from "floating-vue";
import debounce from "lodash/debounce";

import localeEN from "@i18n/en.json";

const i18n = createI18n({
    legacy: false,
    locale: "en", // set locale
    fallbackLocale: "en", // set fallback locale
    messages: {
        en: localeEN,
    },
});

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Input";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    progress: {
        color: "#4B5563",
    },
    resolve: (name) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob("./Pages/**/*.vue"),
        ),
    setup({ el, App, props, plugin }) {
        const vueApp = createApp({ render: () => h(App, props) });

        const pinia = createPinia();
        pinia.use(PiniaDebounce(debounce));

        vueApp
            .use(plugin)
            .use(pinia)
            .use(i18n)
            .use(FloatingVue, {
                themes: {
                    tooltip: {
                        autoHide: true,
                        placement: "auto",
                        html: true,
                    },
                },
            })
            .mixin({ methods: { route: window.route } })
            .mount(el);
    },
});
