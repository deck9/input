import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import DefaultBlockMessage from "./Sidebar/DefaultBlockMessage.vue";
import BlockSubmissionItem from "./Submissions/BlockSubmissionItem.vue";

const unsafeHtml = '<p>Hello</p><img src="x" onerror="window.ran = true">';

describe("question texts in the admin", () => {
    it.each([
        [
            "builder sidebar",
            () =>
                mount(DefaultBlockMessage, { props: { content: unsafeHtml } }),
        ],
        [
            "results",
            () =>
                mount(BlockSubmissionItem, {
                    props: {
                        block: {
                            message: unsafeHtml,
                            session_count: 1,
                            interactions: [],
                        } as Partial<FormBlockModel> as FormBlockModel,
                    },
                }),
        ],
    ])("%s renders without event handlers", (_, mountText) => {
        const wrapper = mountText();

        expect(wrapper.text()).toContain("Hello");
        expect(wrapper.find("img").attributes()).not.toHaveProperty("onerror");
    });
});
