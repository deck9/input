import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import DocumentList from "./DocumentList.vue";
import { addAt } from "./addQuestion";

const blocks = [
    { id: 1, uuid: "b1", type: "input-short", message: "<p>One</p>" },
    { id: 2, uuid: "b2", type: "input-short", message: "<p>Two</p>" },
    { id: 3, uuid: "b3", type: "input-short", message: "<p>Three</p>" },
] as FormBlockModel[];

let wrapper: VueWrapper | undefined;

const mountList = () => {
    useForm().blocks = blocks;
    wrapper = mount(DocumentList, {
        props: { numbers: { b1: 1, b2: 2, b3: 3 } },
        global: { stubs: { QuestionCard: true } },
        attachTo: document.body,
    });
    return wrapper;
};
const option = (name: string) =>
    wrapper!.findAll("[role=option]").find((item) => item.text() === name)!;

describe("adding a question inside the document", () => {
    beforeEach(() => {
        useForm().$reset();
        useWorkbench().$reset();
        addAt.value = null;
    });

    afterEach(() => wrapper?.unmount());

    it("offers Add question here between questions, and adds there", async () => {
        const lines = mountList()
            .findAll("button")
            .filter((button) => button.text().startsWith("Add question here"));

        expect(lines.map((line) => line.text())).toEqual([
            "Add question here, after question 1",
            "Add question here, after question 2",
        ]);

        await lines[0].trigger("click");
        await option("Single choice").trigger("click");

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            blocks[0],
            "radio",
            null,
        );
        expect(wrapper!.find("[role=listbox]").exists()).toBe(false);
    });

    it("adds after a question from the + in its gutter", async () => {
        await mountList()
            .get('button[aria-label="Add question after question 3"]')
            .trigger("click");
        await option("Date").trigger("click");

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            blocks[2],
            "date",
            null,
        );
    });
});

describe("lines and air between blocks", () => {
    const group = { id: 4, uuid: "g1", type: "group" } as FormBlockModel;

    // the box around each block, in document order
    const items = (list: FormBlockModel[]) => {
        useForm().blocks = list;
        wrapper = mount(DocumentList, {
            props: { numbers: { b1: 1, b2: 2, b3: 3 } },
            global: { stubs: { QuestionCard: true, DocumentGroup: true } },
        });
        return wrapper.findAll(".smooth-dnd-draggable-wrapper > div.relative");
    };

    beforeEach(() => {
        useForm().$reset();
        useWorkbench().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it("draws a line at the start of each question but the first, not next to a group", () => {
        const lines = items([blocks[0], group, blocks[1], blocks[2]]).map(
            (item) => item.classes("border-t"),
        );

        expect(lines).toEqual([false, false, false, true]);
    });

    it("gives the open question 24 px above and below, the others 8 px", () => {
        useWorkbench().block = blocks[1];

        const padding = items(blocks).map((item) =>
            ["py-2", "py-6"].filter((name) => item.classes(name)),
        );

        expect(padding).toEqual([["py-2"], ["py-6"], ["py-2"]]);
    });

    it("keeps an open group at 8 px, so its frame doesn't move", () => {
        useWorkbench().block = group;

        expect(items([blocks[0], group])[1].classes()).toContain("py-2");
    });
});
