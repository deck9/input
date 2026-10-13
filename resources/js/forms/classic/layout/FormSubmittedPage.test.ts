import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it } from "vitest";
import FormSubmittedPage from "./FormSubmittedPage.vue";
import { useConversation } from "@/stores/conversation";

const mountPage = (isPreview: boolean) => {
    const pinia = createPinia();
    setActivePinia(pinia);

    const store = useConversation();
    store.form = {
        uuid: "form",
        show_cta_link: true,
        cta_label: "Book a table",
        cta_link: "https://example.com/book",
    } as PublicFormModel;
    store.session = { token: "session" } as FormSessionModel;
    store.isPreview = isPreview;

    return mount(FormSubmittedPage, { global: { plugins: [pinia] } });
};

describe("the end screen's button", () => {
    it("takes people to its link in the same tab, also out of an embed", () => {
        const link = mountPage(false).get("a");

        expect(link.attributes("href")).toBe("https://example.com/book");
        expect(link.attributes("target")).toBe("_top");
        expect(link.attributes("rel")).toBeUndefined();
    });

    // the editor's preview runs the form in a frame: the editor must stay
    it("opens its link in a new tab in preview mode", () => {
        const link = mountPage(true).get("a");

        expect(link.attributes("href")).toBe("https://example.com/book");
        expect(link.attributes("target")).toBe("_blank");
        expect(link.attributes("rel")).toBe("noopener noreferrer");
    });
});
