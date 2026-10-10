import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it } from "vitest";
import BlockLogicRule from "./BlockLogicRule.vue";
import { useForm } from "@/stores";

describe("BlockLogicRule", () => {
    it("shows the Identifier and question text as plain text", () => {
        const pinia = createPinia();
        setActivePinia(pinia);

        useForm().blocks = [
            {
                uuid: "block1",
                type: "input-short",
                title: "<b>age</b>",
                message: "<p>&lt;i&gt;How old are you?&lt;/i&gt;</p>",
            } as FormBlockModel,
        ];

        const wrapper = mount(BlockLogicRule, {
            props: {
                index: 0,
                rule: {
                    name: "Rule",
                    evaluate: "after",
                    action: "goto",
                    action_payload: "block1",
                    conditions: [],
                } as unknown as FormBlockLogic,
            },
            global: { plugins: [pinia] },
        });

        expect(wrapper.find("b").exists()).toBe(false);
        expect(wrapper.find("i").exists()).toBe(false);
        expect(wrapper.find("span.bg-grey-700").text()).toBe("<b>age</b>");
        expect(wrapper.text()).toContain("<i>How old are you?</i>");
    });
});
