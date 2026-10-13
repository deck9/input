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

let wrapper: VueWrapper | undefined;

describe("an open question", () => {
    beforeEach(() => {
        useWorkbench().$reset();
        useForm().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it("makes its answer field without opening Settings", async () => {
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

        wrapper = mount(QuestionCard, {
            props: { block: workbench.block, number: 4 },
            global: { stubs: { Editor: true, BlockMenu: true } },
        });
        await flushPromises();

        expect(workbench.createInteraction).toHaveBeenCalledWith("input");
    });

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
        wrapper = mount(QuestionCard, {
            props: { block, number: 4 },
            global: { stubs: { Editor: true, BlockMenu: true } },
        });
        const button = wrapper
            .findAll("button")
            .find((b) => b.text() === "Settings")!;

        const panel = wrapper.find(`#${button.attributes("aria-controls")}`);
        expect(panel.exists()).toBe(true);
        expect(panel.attributes("role")).toBe("group");
    });
});
