import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import ConfigureClicks from "./ConfigureClicks.vue";

const choice = (id: number, label: string) =>
    ({
        id,
        type: "button",
        label,
        sequence: id,
        is_editable: true,
    }) as FormBlockInteractionModel;

let wrapper: VueWrapper | undefined;

const mountChoices = (...labels: string[]) => {
    return mountList(labels.map((label, i) => choice(i + 1, label)));
};

// a custom answer ("Other") is a hidden row in the same list
const custom = (sequence: number) =>
    ({
        id: 99,
        type: "button",
        label: "Other",
        sequence,
        is_editable: false,
    }) as FormBlockInteractionModel;

const mountList = (interactions: FormBlockInteractionModel[]) => {
    const workbench = useWorkbench();
    useForm().mapping = { radio: "button" } as Record<
        FormBlockType,
        FormBlockInteractionType
    >;
    workbench.block = {
        id: 1,
        uuid: "q1",
        type: "radio",
        interactions,
    } as unknown as FormBlockModel;
    vi.mocked(workbench.deleteInteraction).mockImplementation(
        async ({ id }) => {
            const list = workbench.block!.interactions!;
            list.splice(
                list.findIndex((item) => item.id === id),
                1,
            );
        },
    );

    wrapper = mount(ConfigureClicks, { attachTo: document.body });
    return wrapper;
};

const deleteButton = (label: string) =>
    wrapper!.find(`button[aria-label='Delete choice “${label}”']`);

describe("deleting a choice in its row", () => {
    beforeEach(() => {
        useWorkbench().$reset();
        useForm().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it("moves focus to the choice above", async () => {
        mountChoices("Yes", "No", "Maybe");

        await deleteButton("No").trigger("click");
        await flushPromises();

        expect(document.activeElement?.id).toBe("1_label");
    });

    it("moves focus to the new first choice when the first is gone", async () => {
        mountChoices("Yes", "No");

        await deleteButton("Yes").trigger("click");
        await flushPromises();

        expect(document.activeElement?.id).toBe("2_label");
    });

    it("skips a custom answer row when it moves focus", async () => {
        mountList([custom(0), choice(1, "Yes"), choice(2, "No")]);

        await deleteButton("No").trigger("click");
        await flushPromises();

        expect(document.activeElement?.id).toBe("1_label");
    });

    it("moves focus to Add choice when no choice is left", async () => {
        mountChoices("Yes");

        await deleteButton("Yes").trigger("click");
        await flushPromises();

        const focused = document.activeElement;
        expect(focused?.tagName).toBe("BUTTON");
        expect(focused?.textContent).toContain("Add choice");
    });
});

describe("Enter on the last choice", () => {
    beforeEach(() => {
        useWorkbench().$reset();
        useForm().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it("adds a choice, also with a custom answer last", async () => {
        mountList([choice(1, "Yes"), choice(2, "No"), custom(3)]);
        vi.mocked(useWorkbench().createInteraction).mockResolvedValue(
            undefined,
        );

        await wrapper!.find("[id='2_label']").trigger("keyup", { key: "Enter" });
        await flushPromises();

        expect(useWorkbench().createInteraction).toHaveBeenCalledWith("button");
    });
});
