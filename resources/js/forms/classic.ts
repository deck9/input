import "@css/embed.css";

import { createApp, h, Suspense } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import ClassicForm from "./classic/ClassicForm.vue";

import localeDE from "@i18n/de.json";
import localeEN from "@i18n/en.json";
import localeSK from "@i18n/sk.json";
import localeFR from "@i18n/fr.json";
import localeNO from "@i18n/no.json";
import localeZHCN from "@i18n/zh-CN.json";

const pinia = createPinia();

const i18n = createI18n({
    legacy: false,
    locale: "en", // set locale
    fallbackLocale: "en", // set fallback locale
    messages: {
        en: localeEN,
        de: localeDE,
        sk: localeSK,
        fr: localeFR,
        no: localeNO,
        zhCN: localeZHCN,
    },
});

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
    .use(i18n)
    .mount(mountElement);
