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

describe("Block submit errors", () => {
    const submitWith = async (error: unknown) => {
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
        vi.mocked(callSubmitForm).mockRejectedValueOnce(error);

        const wrapper = mount(Block, {
            props: { block },
            global: { plugins: [pinia], provide: { disableFocus: true } },
        });

        await wrapper.find("form").trigger("submit");
        await flushPromises();

        return wrapper.text();
    };

    it("says the answer is too long when the server refuses it as too long", async () => {
        const text = await submitWith({
            response: {
                status: 422,
                data: { errors: { "payload.block1": ["Too long."] } },
            },
        });

        expect(text).toContain(localeDE.submit_too_long);
        expect(text).not.toContain(localeDE.submit_failed);
    });

    it.each([
        ["a 500", { response: { status: 500, data: {} } }],
        ["a lost connection", new Error("Network Error")],
        [
            "another 422",
            { response: { status: 422, data: { errors: { token: ["x"] } } } },
        ],
    ])("still shows the retry message for %s", async (_, error) => {
        const text = await submitWith(error);

        expect(text).toContain(localeDE.submit_failed);
        expect(text).not.toContain(localeDE.submit_too_long);
    });

    it("goes back to the question whose answer is too long and says it there", async () => {
        const pinia = createPinia();
        setActivePinia(pinia);

        const blocks = ["block1", "block2"].map(
            (id) =>
                ({
                    id,
                    type: "none",
                    interactions: [],
                }) as unknown as PublicFormBlockModel,
        );

        const store = useConversation();
        store.form = { uuid: "form" } as PublicFormModel;
        store.session = { token: "session" } as FormSessionModel;
        store.queue = blocks;
        store.path = ["block1"];
        store.current = "block2";

        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.mocked(callSubmitForm).mockRejectedValueOnce({
            response: {
                status: 422,
                data: { errors: { "payload.block1": ["Too long."] } },
            },
        });

        const last = mount(Block, {
            props: { block: blocks[1] },
            global: { plugins: [pinia], provide: { disableFocus: true } },
        });
        await last.find("form").trigger("submit");
        await flushPromises();

        expect(store.current).toBe("block1");
        expect(store.path).toEqual([]);
        expect(last.text()).not.toContain(localeDE.submit_too_long);

        const first = mount(Block, {
            props: { block: blocks[0] },
            global: { plugins: [pinia], provide: { disableFocus: true } },
        });
        expect(first.text()).toContain(localeDE.submit_too_long);
    });
});
