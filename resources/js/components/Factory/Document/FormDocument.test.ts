import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import FormDocument from "./FormDocument.vue";

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
const scrolled = vi.fn();

describe("the form document", () => {
    beforeEach(() => {
        Element.prototype.scrollIntoView = function (this: Element) {
            scrolled(this.id);
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

        expect(scrolled).toHaveBeenCalledWith("row-b2");
    });
});
