import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import IntegrationEdit from "./IntegrationEdit.vue";
import { callUpdateformWebhooks } from "@/api/webhooks.js";

vi.mock("@/api/webhooks.js", () => ({
    callCreateformWebhooks: vi.fn(),
    callUpdateformWebhooks: vi.fn().mockResolvedValue({}),
    callDeleteFormIntegration: vi.fn(),
}));

// the headlessui dialog needs it, jsdom has none
vi.stubGlobal(
    "ResizeObserver",
    class {
        observe() {}
        disconnect() {}
    },
);

describe("integration edit", () => {
    it("keeps the headers when a webhook is saved", async () => {
        const wrapper = mount(IntegrationEdit, {
            props: { form: { uuid: "form1" } as FormModel },
            attachTo: document.body,
        });

        wrapper.vm.edit({
            id: 1,
            name: "Zapier",
            webhook_url: "https://example.com/hook",
            webhook_method: "POST",
            headers: { Authorization: "Bearer secret" },
        } as FormWebhookModel);
        await flushPromises();

        document.querySelector("form")?.dispatchEvent(new Event("submit"));
        await flushPromises();

        expect(callUpdateformWebhooks).toHaveBeenCalledWith(
            { uuid: "form1" },
            expect.objectContaining({
                headers: { Authorization: "Bearer secret" },
            }),
        );

        wrapper.unmount();
    });
});
