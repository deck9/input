import { createApp, h } from "vue";
import { createInertiaApp } from "@inertiajs/inertia-vue3";
import { InertiaProgress } from "@inertiajs/progress";
import { createPinia } from 'pinia'

const appName =
    window.document.getElementsByTagName("title")[0]?.innerText || "Survy";

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => require(`./Pages/${name}.vue`),
    setup({ el, app, props, plugin }) {
        const vueApp = createApp({ render: () => h(app, props) })

        vueApp.use(plugin)
            .use(createPinia())
            .mixin({ methods: { route: window.route } })
            .mount(el);
    },
});

InertiaProgress.init({ color: "#4B5563" });
