import "@css/app.css";
import { createApp, h } from "vue";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createInertiaApp } from "@inertiajs/inertia-vue3";
import { InertiaProgress } from "@inertiajs/progress";
import { createPinia } from "pinia";
import { PiniaDebounce } from "@pinia/plugin-debounce";
import debounce from "lodash/debounce";

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Input";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob("./Pages/**/*.vue")
        ),
    setup({ el, app, props, plugin }) {
        const vueApp = createApp({ render: () => h(app, props) });

        const pinia = createPinia();
        pinia.use(PiniaDebounce(debounce));

        vueApp
            .use(plugin)
            .use(pinia)
            .mixin({ methods: { route: window.route } })
            .mount(el);
    },
});

InertiaProgress.init({ color: "#4B5563" });
