import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import DocumentOutline from "./DocumentOutline.vue";

const blocks = [
    { id: 1, uuid: "q1", type: "none", message: "<p>Welcome</p>" },
    { id: 2, uuid: "g1", type: "group", title: "Food" },
    { id: 3, uuid: "q2", type: "radio", message: "", parent_block: "g1" },
    { id: 4, uuid: "q3", type: "input-short", message: "<p>Name?</p>" },
] as FormBlockModel[];

const numbers = { q1: 1, q2: 2, q3: 3 };

describe("the outline", () => {
    beforeEach(() => {
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
});
