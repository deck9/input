import { config } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import { createI18n } from "vue-i18n";

import localeDE from "@i18n/de.json";
import localeEN from "@i18n/en.json";

const i18n = createI18n({
    legacy: false,
    locale: "de", // set locale
    fallbackLocale: "en", // set fallback locale
    messages: {
        en: localeEN,
        de: localeDE,
    },
});

config.global.plugins = [createTestingPinia(), i18n];
