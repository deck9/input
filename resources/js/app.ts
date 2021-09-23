import { App, createApp, h } from "vue";
import { createInertiaApp } from "@inertiajs/inertia-vue3";
import { InertiaProgress } from "@inertiajs/progress";
import { RouteParamsWithQueryOverload, Config, Router } from "ziggy-js";

declare function route(
    name?: undefined,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): Router;

declare function route(
    name: string,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): string;

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Laravel";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => require(`./Pages/${name}.vue`),
    setup({ el, app, props, plugin }) {
        const vueApp = createApp({ render: () => h(app, props) })

        vueApp.use(plugin)
            .mixin({ methods: { route } })
            .mount(el);

        return vueApp as App
    },
});

InertiaProgress.init({ color: "#4B5563" });
