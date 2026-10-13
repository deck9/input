import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import QuestionCard from "./QuestionCard.vue";

const block = {
    id: 4,
    uuid: "q4",
    type: "input-short",
    message: "<p>Your name?</p>",
    interactions: [],
} as unknown as FormBlockModel;

const stubs = {
    Editor: true,
    BlockMenu: true,
    QuestionSettings: {
        props: ["id"],
        template: `<div :id="id">settings</div>`,
    },
};

let wrapper: VueWrapper | undefined;

const mountCard = (phone: boolean, withStubs: object = stubs) => {
    window.matchMedia = vi.fn().mockReturnValue({
        matches: phone,
        addEventListener: () => {},
        removeEventListener: () => {},
    });
    wrapper = mount(QuestionCard, {
        props: { block: useWorkbench().block ?? block, number: 4 },
        global: { stubs: withStubs },
        attachTo: document.body,
    });
    return wrapper;
};
const settingsButton = () =>
    wrapper!.findAll("button").find((b) => b.text() === "Settings")!;

describe("an open question", () => {
    beforeEach(() => {
        globalThis.ResizeObserver ??= class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
        useWorkbench().$reset();
        useForm().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it.each([
        ["a wider screen", false],
        ["a phone", true],
    ])(
        "makes its answer field without opening Settings, on %s",
        async (_, phone) => {
            const workbench = useWorkbench();
            useForm().mapping = { "input-short": "input" } as Record<
                FormBlockType,
                FormBlockInteractionType
            >;
            workbench.block = { ...block, interactions: [] };
            vi.mocked(workbench.createInteraction).mockResolvedValue({
                id: 9,
                type: "input",
                label: "",
            } as unknown as FormBlockInteractionModel);

            mountCard(phone, { Editor: true, BlockMenu: true });
            await flushPromises();

            expect(workbench.createInteraction).toHaveBeenCalledWith("input");
        },
    );

    it("shows Required only when the question takes an answer", () => {
        const stubs = { Editor: true, BlockMenu: true, QuestionSettings: true };
        wrapper = mount(QuestionCard, {
            props: { block: { ...block, type: "none" }, number: 1 },
            global: { stubs },
        });
        expect(wrapper.text()).not.toContain("Required");

        wrapper.unmount();
        wrapper = mount(QuestionCard, {
            props: { block, number: 4 },
            global: { stubs },
        });
        expect(wrapper.text()).toContain("Required");
    });

    it("points the Settings button at its panel", () => {
        mountCard(false, { Editor: true, BlockMenu: true });

        const panel = wrapper!.find(
            `#${settingsButton().attributes("aria-controls")}`,
        );
        expect(panel.exists()).toBe(true);
        expect(panel.attributes("role")).toBe("group");
    });

    it("opens its settings inside the card on a wider screen", async () => {
        mountCard(false);
        await settingsButton().trigger("click");

        expect(wrapper!.find("#question-q4-settings").isVisible()).toBe(true);
        expect(document.querySelector("[role=dialog]")).toBeNull();
    });

    it("opens its settings as a bottom sheet on a phone, and Done closes it", async () => {
        mountCard(true);
        await settingsButton().trigger("click");
        await flushPromises();

        const sheet = document.querySelector<HTMLElement>("[role=dialog]");
        expect(sheet?.textContent).toContain("Question 4 settings");
        expect(sheet?.textContent).toContain("settings");

        const done = [...sheet!.querySelectorAll("button")].find(
            (b) => b.textContent?.trim() === "Done",
        );
        done!.click();
        await flushPromises();

        // closed but kept, hidden: its answer field settings stay mounted
        expect(
            document.querySelector<HTMLElement>("[role=dialog]")?.hidden,
        ).toBe(true);
        expect(document.getElementById("question-q4-settings")).not.toBeNull();
    });

    describe("typing / in its text", () => {
        const editorStub = {
            template: `<div><div contenteditable="true" /></div>`,
            methods: { focus() {} },
        };
        const slash = async (message: string | null) => {
            useWorkbench().block = { ...block, message };
            mountCard(false, { ...stubs, Editor: editorStub });
            const typed = await wrapper!
                .find("[contenteditable]")
                .trigger("keydown", { key: "/" });
            return typed;
        };

        it("opens the picker in an empty question, and a pick changes its type", async () => {
            await slash(null);
            const option = wrapper!
                .findAll("[role=option]")
                .find((item) => item.text() === "Single choice")!;
            await option.trigger("click");

            expect(useWorkbench().updateBlock).toHaveBeenCalledWith({
                type: "radio",
            });
            expect(wrapper!.find("[role=listbox]").exists()).toBe(false);
        });

        it("stays a / in a question with text", async () => {
            await slash("<p>Your name?</p>");

            expect(wrapper!.find("[role=listbox]").exists()).toBe(false);
        });
    });
});
