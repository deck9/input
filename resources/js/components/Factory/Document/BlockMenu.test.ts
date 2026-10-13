import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import BlockMenu from "./BlockMenu.vue";

const blocks = [
    { id: 1, uuid: "q1", type: "radio" },
    { id: 2, uuid: "q2", type: "radio" },
] as FormBlockModel[];

let wrapper: VueWrapper | undefined;

const openMenu = async (block: FormBlockModel) => {
    wrapper = mount(BlockMenu, {
        props: { block, label: "Options for question 1" },
        attachTo: document.body,
    });
    await wrapper.find("button").trigger("click");
    await flushPromises();
};

// the menu opens in a portal
const item = (label: string) =>
    [...document.querySelectorAll<HTMLElement>("[role=menuitem]")].find(
        (element) => element.textContent?.trim() === label,
    );

describe("a block's menu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useWorkbench().$reset();
        useForm().$reset();
        useForm().blocks = blocks;
    });

    afterEach(() => {
        wrapper?.unmount();
        document.body.innerHTML = "";
    });

    it("moves a question down, for touch and pointer users", async () => {
        await openMenu(blocks[0]);

        item("Move down")!.click();
        await flushPromises();

        expect(useForm().changeBlockSequence).toHaveBeenCalledWith(
            false,
            1,
            blocks[0],
        );
    });

    it("can't move the first block up or the last one down", async () => {
        await openMenu(blocks[0]);
        expect(item("Move up")?.getAttribute("aria-disabled")).toBe("true");
        expect(item("Move down")?.getAttribute("aria-disabled")).toBeNull();
        wrapper!.unmount();
        document.body.innerHTML = "";

        await openMenu(blocks[1]);
        expect(item("Move up")?.getAttribute("aria-disabled")).toBeNull();
        expect(item("Move down")?.getAttribute("aria-disabled")).toBe("true");
    });
});
