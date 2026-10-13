import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callGetFormBlocks } from "@/api/blocks";
import { useForm, useWorkbench } from "@/stores";
import BlockMenu from "./BlockMenu.vue";

vi.mock("@/api/blocks", async (importOriginal) => ({
    ...(await importOriginal()),
    callGetFormBlocks: vi.fn(),
}));

const blocks = [
    { id: 1, uuid: "q1", type: "radio" },
    { id: 2, uuid: "q2", type: "radio" },
] as FormBlockModel[];

const group = { id: 3, uuid: "g1", type: "group" } as FormBlockModel;

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

    it("duplicates a question", async () => {
        await openMenu(blocks[0]);

        item("Duplicate")!.click();
        await flushPromises();

        expect(useForm().duplicateFormBlock).toHaveBeenCalledWith(blocks[0]);
    });

    it("has no Duplicate for a group, which the server can't copy", async () => {
        await openMenu(group);

        expect(item("Duplicate")).toBeUndefined();
        expect(item("Add question to this group")).toBeDefined();
    });
});

describe("deleting from a block's menu", () => {
    const q1 = { id: 1, uuid: "q1", type: "radio" } as FormBlockModel;
    const g1 = { id: 2, uuid: "g1", type: "group" } as FormBlockModel;
    const q3 = { id: 3, uuid: "q3", type: "radio", parent_block: "g1" };
    const q2 = { id: 4, uuid: "q2", type: "radio" } as FormBlockModel;

    // the rows FormDocument shows, and its Add question button
    const showRows = (...uuids: string[]) => {
        document.body.innerHTML = uuids
            .map(
                (uuid) =>
                    `<div id="row-${uuid}"><button>${uuid}</button></div>`,
            )
            .join("");
        document.body.insertAdjacentHTML(
            "beforeend",
            '<div id="add-buttons"><button>Add question</button></div>',
        );
    };

    const deleteFrom = async (block: FormBlockModel) => {
        await openMenu(block);
        item(block.type === "group" ? "Delete group…" : "Delete…")!.click();
        await flushPromises();
        // the dialog asks first: nothing is deleted yet
        expect(useForm().deleteFormBlock).not.toHaveBeenCalled();

        document
            .querySelector<HTMLElement>("[role=alertdialog] button.bg-red-600")!
            .click();
        await flushPromises();
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useWorkbench().$reset();
        const form = useForm();
        form.$reset();
        form.form = { uuid: "form1" } as FormModel;
        form.blocks = [q1, g1, q3 as FormBlockModel, q2];
        vi.mocked(callGetFormBlocks).mockResolvedValue({
            data: form.blocks,
        } as AxiosResponse<FormBlockModel[]>);
        vi.mocked(form.deleteFormBlock).mockImplementation(async (block) => {
            form.blocks = form.blocks!.filter(
                (item) =>
                    item.id !== block.id && item.parent_block !== block.uuid,
            );
        });
    });

    afterEach(() => {
        wrapper?.unmount();
        document.body.innerHTML = "";
    });

    it("moves focus to the next row, past a deleted group's questions", async () => {
        showRows("q1", "g1", "q3", "q2");

        await deleteFrom(g1);

        expect(useForm().deleteFormBlock).toHaveBeenCalledWith(g1);
        expect(document.activeElement?.textContent).toBe("q2");
    });

    it("moves focus to the row above when the last one is deleted", async () => {
        showRows("q1", "g1", "q3", "q2");

        await deleteFrom(q2);

        expect(document.activeElement?.closest("[id^=row-]")?.id).toBe(
            "row-q3",
        );
    });

    it("moves focus to Add question when no block is left", async () => {
        useForm().blocks = [q1];
        showRows("q1");

        await deleteFrom(q1);

        expect(document.activeElement?.textContent).toBe("Add question");
    });

    it("keeps focus on the row when the delete fails", async () => {
        vi.mocked(useForm().deleteFormBlock).mockResolvedValue();
        showRows("q1", "g1", "q3", "q2");

        await deleteFrom(q1);

        expect(document.activeElement?.textContent).toBe("q1");
    });
});
