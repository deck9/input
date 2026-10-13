import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import CompletionPage from "./CompletionPage.vue";
import { useForm } from "@/stores";

describe("end screen settings", () => {
    it("ties the Message label to its editor", async () => {
        useForm().form = { uuid: "form1" } as FormModel;
        const wrapper = mount(CompletionPage, {
            attachTo: document.body,
            global: { directives: { tooltip: {} } },
        });
        await vi.waitFor(() => expect(wrapper.find("[role=textbox]").exists()).toBe(true));
        const editor = wrapper.find("[role=textbox]");

        expect(editor.attributes("aria-labelledby")).toBe("eoc-message-label");
        expect(wrapper.find("#eoc-message-label").text()).toBe("Message");

        await wrapper.find("#eoc-message-label").trigger("click");

        await vi.waitFor(() => expect(document.activeElement).toBe(editor.element));
        wrapper.unmount();
    });
});
