import { createApp, h } from "vue";
import { createPinia } from "pinia";
import ClassicForm from "./classic/ClassicForm.vue";

const pinia = createPinia();

createApp({
    setup: () => {
        return () =>
            h(ClassicForm, {
                settings: window.iptSettings,
            });
    },
})
    .use(pinia)
    .mixin({ methods: { route: window.route } })
    .mount("#input-classic");
