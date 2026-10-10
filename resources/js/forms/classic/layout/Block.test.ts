import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import Block from "./Block.vue";
import { useConversation } from "@/stores/conversation";
import { callSubmitForm } from "@/api/conversation";
import localeDE from "@i18n/de.json";

vi.mock("@/api/conversation", async (importOriginal) => ({
    ...((await importOriginal()) as object),
    callSubmitForm: vi.fn(),
}));

describe("Block", () => {
    it("shows a retry message when the submit fails", async () => {
        const pinia = createPinia();
        setActivePinia(pinia);

        const block = {
            id: "block1",
            type: "none",
            interactions: [],
        } as unknown as PublicFormBlockModel;

        const store = useConversation();
        store.form = { uuid: "form" } as PublicFormModel;
        store.session = { token: "session" } as FormSessionModel;
        store.queue = [block];
        store.current = "block1";

        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.mocked(callSubmitForm).mockRejectedValueOnce(new Error("500"));

        const wrapper = mount(Block, {
            props: { block },
            global: { plugins: [pinia], provide: { disableFocus: true } },
        });

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        expect(wrapper.text()).toContain(localeDE.submit_failed);
        expect(
            wrapper.findComponent({ name: "FormButton" }).props("isProcessing"),
        ).toBe(false);
    });
});
