import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import DocumentOutline from "./DocumentOutline.vue";

const blocks = [
    { id: 1, uuid: "q1", type: "none", message: "<p>Welcome</p>" },
    { id: 2, uuid: "g1", type: "group", title: "Food" },
    { id: 3, uuid: "q2", type: "radio", message: "", parent_block: "g1" },
    { id: 4, uuid: "q3", type: "input-short", message: "<p>Name?</p>" },
] as FormBlockModel[];

const numbers = { q1: 1, q2: 2, q3: 3 };

const scrolled = vi.fn();

describe("the outline", () => {
    beforeEach(() => {
        // jsdom has no scrollIntoView
        Element.prototype.scrollIntoView = function (
            this: Element,
            options?: boolean | ScrollIntoViewOptions,
        ) {
            scrolled(this.textContent, (options as ScrollIntoViewOptions)?.block);
        };
        useForm().$reset();
        useWorkbench().$reset();
        useForm().blocks = blocks;
    });

    it("lists questions in document order under their group, never by id", () => {
        const wrapper = mount(DocumentOutline, { props: { numbers } });
        const lines = wrapper.findAll("li").map((li) => li.text());

        expect(lines).toEqual([
            "1Welcome",
            "Food",
            "2No question text yet",
            "3Name?",
        ]);
    });

    it("marks the open question and says which one was picked", async () => {
        useWorkbench().block = blocks[3];
        const wrapper = mount(DocumentOutline, { props: { numbers } });
        const current = wrapper.find("[aria-current=true]");

        expect(current.text()).toBe("3Name?");

        await wrapper.findAll("button")[0].trigger("click");
        expect(wrapper.emitted("pick")?.[0]).toEqual([blocks[0]]);
    });

    it("keeps the open question in view, also when it opens as a panel", async () => {
        useWorkbench().block = blocks[3];
        const wrapper = mount(DocumentOutline, {
            props: { numbers },
            attachTo: document.body,
        });
        await wrapper.vm.$nextTick();
        expect(scrolled).toHaveBeenLastCalledWith("3Name?", "nearest");

        useWorkbench().block = blocks[0];
        await wrapper.vm.$nextTick();
        expect(scrolled).toHaveBeenLastCalledWith("1Welcome", "nearest");

        wrapper.unmount();
    });
});
