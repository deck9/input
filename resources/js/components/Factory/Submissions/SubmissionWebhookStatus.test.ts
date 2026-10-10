import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import SubmissionWebhookStatus from "./SubmissionWebhookStatus.vue";

// renders the tooltip content without opening the tooltip
const VTooltip = {
    setup(_: unknown, { slots }: { slots: Record<string, () => unknown> }) {
        return () => h("div", [slots.default?.(), slots.popper?.()]);
    },
};

describe("webhook response in the submissions view", () => {
    it("shows a text response as plain text", () => {
        const response = "<p>Hello</p><script>window.ran = true</script>";
        const wrapper = mount(SubmissionWebhookStatus, {
            props: {
                webhook: {
                    name: "Hook",
                    status: 200,
                    response,
                } as Partial<FormSessionWebhookModel> as FormSessionWebhookModel,
            },
            global: { stubs: { VTooltip } },
        });

        const pre = wrapper.find("pre");
        expect(pre.text()).toBe(response);
        expect(pre.element.children).toHaveLength(0);
    });
});
