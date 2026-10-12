import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SearchField from "./SearchField.vue";

const mountField = (query = "") =>
    mount(SearchField, {
        props: {
            modelValue: query,
            "onUpdate:modelValue": (value: string) =>
                wrapper.setProps({ modelValue: value }),
        },
        attachTo: document.body,
    });
let wrapper: ReturnType<typeof mountField>;

describe("search field", () => {
    it("is a search with a label for screen readers", () => {
        wrapper = mountField();

        const input = wrapper.get("input[type=search]");
        expect(wrapper.get("form").attributes("role")).toBe("search");
        expect(wrapper.get(`label[for="${input.attributes("id")}"]`).text()).toBe(
            "Search forms",
        );
        wrapper.unmount();
    });

    it("jumps to the search on /, but not while typing elsewhere", async () => {
        wrapper = mountField();
        const other = document.createElement("textarea");
        document.body.append(other);

        other.focus();
        other.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
        expect(document.activeElement).toBe(other);

        other.blur();
        document.body.dispatchEvent(
            new KeyboardEvent("keydown", { key: "/", bubbles: true }),
        );
        expect(document.activeElement).toBe(wrapper.get("input").element);

        other.remove();
        wrapper.unmount();
    });

    it("clears the search on Esc", async () => {
        wrapper = mountField("muller");
        await wrapper.get("input").trigger("keydown", { key: "Escape" });

        expect(wrapper.props("modelValue")).toBe("");
        wrapper.unmount();
    });
});
