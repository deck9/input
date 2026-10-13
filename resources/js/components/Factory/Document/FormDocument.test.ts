import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import FormDocument from "./FormDocument.vue";
import { moveNote } from "./blockMove";

const blocks = [
    { id: 1, uuid: "b1", type: "none", message: "<p>Welcome</p>" },
    { id: 2, uuid: "b2", type: "none", message: "<p>Second</p>" },
] as FormBlockModel[];

const stubs = {
    DocumentList: {
        template: `<div><div id="row-b1" /><div id="row-b2" /></div>`,
    },
    RuleGutter: true,
};

let wrapper: VueWrapper | undefined;
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
