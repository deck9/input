import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TextareaAction from "./TextareaAction.vue";

describe("TextareaAction", () => {
    it("uses the default height when the question has no options", () => {
        const wrapper = mount(TextareaAction, {
            props: {
                block: { id: "q1", type: "input-long" } as PublicFormBlockModel,
                action: {
                    id: "a1",
                    options: null,
                } as unknown as PublicFormBlockInteractionModel,
            },
            global: { provide: { disableFocus: false } },
        });

        expect(wrapper.get("textarea").attributes("rows")).toBe("5");
    });
});
