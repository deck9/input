import { config, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { useConversation } from "@/stores/conversation";
import Block from "./layout/Block.vue";
import ConsentAction from "./interactions/ConsentAction.vue";
import FormSubmittedPage from "./layout/FormSubmittedPage.vue";
import FooterNavigation from "./layout/FooterNavigation.vue";

const unsafeHtml = '<p>Hello</p><img src="x" onerror="window.ran = true">';

// HTML as the form editor (tiptap) saves it
const editorHtml =
    "<h2>Title</h2>" +
    "<p><strong>bold</strong> <em>italic</em> <u>underline</u> <s>strike</s> <code>code</code> " +
    '<a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">link</a> ' +
    '<span style="font-family: serif">font</span><br>line</p>' +
    "<h3>Subtitle</h3>" +
    "<ul><li><p>one</p></li></ul>" +
    '<ol start="3"><li><p>three</p></li></ol>' +
    "<blockquote><p>quote</p></blockquote>" +
    "<pre><code>code block</code></pre>" +
    '<img src="https://example.com/a.png" alt="alt" title="title"><hr>';

const block = (message: string) =>
    ({
        id: "1",
        type: "none",
        message,
        interactions: [],
    }) as Partial<PublicFormBlockModel>;

const mountBlock = (message: string) =>
    mount(Block, { props: { block: block(message) } });

const mountConsent = (message: string) =>
    mount(ConsentAction, {
        props: {
            index: 0,
            block: block(""),
            action: { id: "a", label: "Consent", message },
        },
    });

const mountSubmittedPage = (eoc_text: string) => {
    useConversation().form = { eoc_text } as PublicFormModel;

    return mount(FormSubmittedPage);
};

describe("form texts", () => {
    beforeEach(() => {
        config.global.provide = { disableFocus: true };
    });

    it.each([
        ["question", mountBlock],
        ["consent", mountConsent],
        ["end", mountSubmittedPage],
    ])("%s text renders without event handlers", (_, mountText) => {
        const wrapper = mountText(unsafeHtml);

        expect(wrapper.text()).toContain("Hello");
        expect(wrapper.find("img").attributes()).not.toHaveProperty("onerror");
    });

    it("keeps the formatting the editor saves", () => {
        const wrapper = mountBlock(editorHtml);

        expect(wrapper.find(".form-message-prose").element.innerHTML).toBe(
            editorHtml,
        );
    });
});

describe("form links", () => {
    it("hides a stored call to action link that is not http(s) or mailto", () => {
        const store = useConversation();
        store.session = { token: "t" } as FormSessionModel;
        store.form = {
            show_cta_link: true,
            cta_link: "javascript:void(0)",
        } as PublicFormModel;

        expect(mount(FormSubmittedPage).find("a").exists()).toBe(false);

        store.form.cta_link = "mailto:team@example.com";

        expect(mount(FormSubmittedPage).find("a").attributes("href")).toBe(
            "mailto:team@example.com",
        );
    });

    it("hides a stored privacy link that is not http(s) or mailto", () => {
        const wrapper = mount(FooterNavigation, {
            props: {
                form: {
                    privacy_link: "javascript:void(0)",
                    legal_notice_link: "https://example.com/legal",
                } as PublicFormModel,
            },
        });

        expect(wrapper.findAll("a").map((a) => a.attributes("href"))).toEqual([
            "https://example.com/legal",
        ]);
    });
});
