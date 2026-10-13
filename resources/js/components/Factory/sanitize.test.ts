import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DocumentQuestion from "./Document/DocumentQuestion.vue";
import BlockSubmissionItem from "./Submissions/BlockSubmissionItem.vue";

const unsafeHtml = '<p>Hello</p><img src="x" onerror="window.ran = true">';

describe("question texts in the admin", () => {
    it("results render without event handlers", () => {
        const wrapper = mount(BlockSubmissionItem, {
            props: {
                block: {
                    message: unsafeHtml,
                    session_count: 1,
                    interactions: [],
                } as Partial<FormBlockModel> as FormBlockModel,
            },
        });

        expect(wrapper.text()).toContain("Hello");
        expect(wrapper.find("img").attributes()).not.toHaveProperty("onerror");
    });

    it("the editor's document shows the text as plain text", () => {
        const wrapper = mount(DocumentQuestion, {
            props: {
                block: {
                    id: 1,
                    uuid: "a",
                    type: "radio",
                    message: unsafeHtml,
                    interactions: [],
                } as Partial<FormBlockModel> as FormBlockModel,
                number: 1,
            },
        });

        expect(wrapper.text()).toContain("Hello");
        expect(wrapper.find("img").exists()).toBe(false);
    });
});
