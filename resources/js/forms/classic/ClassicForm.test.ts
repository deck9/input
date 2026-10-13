import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, Suspense } from "vue";
import { useConversation } from "@/stores/conversation";
import ClassicForm from "./ClassicForm.vue";

vi.mock("@/utils/useRoutes", () => ({ useRoutes: vi.fn(async () => ({})) }));

const question = (id: string) => ({
    id,
    type: "input-short",
    title: id,
    parent_block: null,
    is_required: false,
    logics: [],
    interactions: [{ id: `${id}-input`, type: "input", label: "Your answer" }],
});

vi.mock("@/api/conversation", () => ({
    callCreateFormSession: vi.fn(async () => ({ data: { token: "session" } })),
    callGetFormStoryboard: vi.fn(async () => ({
        data: { blocks: [question("q1"), question("q2")] },
    })),
    callSubmitForm: vi.fn(),
}));

enableAutoUnmount(afterEach);

const mountForm = async (search: string) => {
    window.history.replaceState(null, "", `/form1${search}`);
    const pinia = createPinia();
    setActivePinia(pinia);

    const Page = defineComponent(() => () =>
        h(Suspense, null, {
            default: () =>
                h(ClassicForm, {
                    settings: { uuid: "form1", name: "Form", language: "en" } as PublicFormModel,
                    flags: {} as EmbedFlags,
                }),
        }),
    );
    mount(Page, { attachTo: document.body, global: { plugins: [pinia] } });
    await flushPromises();

    // the form moves to the next question, or the editor sends the preview there
    useConversation().startAt("q2");
    await flushPromises();
};

describe("the public form", () => {
    afterEach(() => {
        delete (window as { iptSettings?: unknown }).iptSettings;
        (document.activeElement as HTMLElement | null)?.blur();
    });

    it("puts the cursor in the next question's field", async () => {
        await mountForm("");

        expect(document.activeElement?.tagName).toBe("INPUT");
    });

    // the editor's preview frame: the cursor must stay in the editor
    it("takes no focus in preview mode while the owner works in the editor", async () => {
        window.iptSettings = {} as typeof window.iptSettings;
        await mountForm("?preview=1&block=q1");

        expect(document.hasFocus()).toBe(false);
        expect(useConversation().isPreview).toBe(true);
        expect(useConversation().current).toBe("q2");
        expect(document.activeElement).toBe(document.body);
    });

    it("moves the cursor on in preview mode while the owner works in the preview", async () => {
        window.iptSettings = {} as typeof window.iptSettings;
        await mountForm("?preview=1&block=q1");

        // a click into the frame focuses its window
        window.dispatchEvent(new FocusEvent("focus"));
        useConversation().startAt("q1");
        await flushPromises();
        expect(document.activeElement?.tagName).toBe("INPUT");

        // back in the editor
        (document.activeElement as HTMLElement).blur();
        window.dispatchEvent(new FocusEvent("blur"));
        useConversation().startAt("q2");
        await flushPromises();
        expect(document.activeElement).toBe(document.body);
    });
});
