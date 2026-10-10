import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useConversation } from "@/stores/conversation";
import InputAction from "./InputAction.vue";

describe("InputAction", () => {
    it("shows a stored answer with HTML as plain text", () => {
        const html = "<img src=x onerror=alert(1)>";
        const store = useConversation();
        store.current = "q1";
        store.payload = { q1: { payload: html, actionId: "a1" } };

        const wrapper = mount(InputAction, {
            props: {
                block: { id: "q1", type: "input-short" } as PublicFormBlockModel,
                action: { id: "a1", options: {} } as PublicFormBlockInteractionModel,
            },
            global: { provide: { disableFocus: false } },
        });

        expect(wrapper.get("input").element.value).toBe(html);
        expect(wrapper.find("img").exists()).toBe(false);
    });
});
