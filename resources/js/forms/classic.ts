import "@css/app.css";
import { createApp, h } from "vue";
import { createPinia } from "pinia";
import ClassicForm from "./classic/ClassicForm.vue";
import { useRoutes } from "@/utils/useRoutes";

const pinia = createPinia();
const { route } = useRoutes();

createApp({
    setup: () => {
        return () =>
            h(ClassicForm, {
                settings: window.iptSettings,
            });
    },
})
    .use(pinia)
    .mixin({ methods: { route } })
    .mount("#input-classic");
