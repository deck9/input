import "@css/embed.css";
import { createApp, h, Suspense } from "vue";
import { createPinia } from "pinia";
import ClassicForm from "./classic/ClassicForm.vue";

const pinia = createPinia();

const formId = document.currentScript?.getAttribute("data-form");
let mountElement: Element | string | null = document.querySelector(
    `#${formId}-wrapper`
);

if (!mountElement) {
    mountElement = "#input-classic";
}

const flags: EmbedFlags = {
    hideTitle:
        document.currentScript?.getAttribute("data-hide-title") === "true",
    hideNavigation:
        document.currentScript?.getAttribute("data-hide-navigation") === "true",
    autofocus:
        document.currentScript?.getAttribute("data-autofocus") === "true",
    alignLeft:
        document.currentScript?.getAttribute("data-alignleft") === "true",
};

createApp({
    setup: () => {
        return () =>
            h(Suspense, null, {
                default: h(ClassicForm, {
                    settings: window.iptSettings ? window.iptSettings : formId,
                    flags,
                }),
            });
    },
})
    .use(pinia)
    .mount(mountElement);
