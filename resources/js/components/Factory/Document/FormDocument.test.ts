import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import FormDocument from "./FormDocument.vue";
import { cursorFor } from "./blockFocus";
import { addAt } from "./addQuestion";
import { moveNote } from "./blockMove";

const blocks = [
    { id: 1, uuid: "b1", type: "none", message: "<p>Welcome</p>" },
    { id: 2, uuid: "b2", type: "none", message: "<p>Second</p>" },
] as FormBlockModel[];

const stubs = {
    DocumentList: {
        template: `<div><div id="row-b1" /><div id="row-b2" /></div>`,
    },
    BlockLogicEditor: true,
};

let wrapper: VueWrapper | undefined;
const option = (name: string) =>
    wrapper!.findAll("[role=option]").find((item) => item.text() === name)!;
const scrolled = vi.fn();

describe("the form document", () => {
    beforeEach(() => {
        Element.prototype.scrollIntoView = function (
            this: Element,
            options?: boolean | ScrollIntoViewOptions,
        ) {
            scrolled(this.id, (options as ScrollIntoViewOptions)?.block);
        };
        scrolled.mockClear();
        useForm().$reset();
        useWorkbench().$reset();
        addAt.value = null;
        cursorFor.value = null;
    });

    afterEach(() => wrapper?.unmount());

    it("scrolls the question opened by link into view once it loads", async () => {
        wrapper = mount(FormDocument, {
            props: { status: "loading" },
            global: { stubs },
            attachTo: document.body,
        });

        useForm().blocks = blocks;
        useWorkbench().block = blocks[1];
        await wrapper.setProps({ status: "loaded" });
        await wrapper.vm.$nextTick();

        // the smallest scroll, so a question already in view stays put
        expect(scrolled).toHaveBeenCalledWith("row-b2", "nearest");
    });

    it("opens and scrolls to a question picked in the outline", async () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        await wrapper.findAll("nav li button")[1].trigger("click");
        await flushPromises();

        expect(useWorkbench().putOnWorkbench).toHaveBeenCalledWith(blocks[1]);
        expect(scrolled).toHaveBeenCalledWith("row-b2", "start");
    });

    it("shows the picker on an empty form and adds the first question", async () => {
        useForm().blocks = [];
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        expect(wrapper.text()).toContain("Add your first question");
        await option("Short text").trigger("click");

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            null,
            "input-short",
            null,
        );
    });

    it("adds a question at the end, also with one open, with the cursor in its text", async () => {
        const added = {
            id: 3,
            uuid: "b3",
            type: "input-email",
        } as FormBlockModel;
        useForm().blocks = blocks;
        useWorkbench().block = blocks[0];
        vi.mocked(useForm().createFormBlock).mockImplementation(async () => {
            useWorkbench().block = added;
        });
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        await wrapper
            .findAll("button")
            .find((button) => button.text() === "Add question")!
            .trigger("click");
        expect(wrapper.text()).toContain("Add a question at the end");
        await option("Email").trigger("click");
        await flushPromises();

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            null,
            "input-email",
            null,
        );
        expect(cursorFor.value).toBe("b3");
    });

    it("reads out where a moved question went", async () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        moveNote.value = "Moved to position 2 of 2";
        await wrapper.vm.$nextTick();

        expect(
            document.querySelector("[aria-live=polite]")?.textContent,
        ).toBe("Moved to position 2 of 2");
    });
});
