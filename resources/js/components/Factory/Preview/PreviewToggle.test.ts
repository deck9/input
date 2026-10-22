import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import PreviewToggle from "./PreviewToggle.vue";

const mountToggle = (open: boolean) =>
    mount(PreviewToggle, {
        props: { modelValue: open, "onUpdate:modelValue": () => {} },
    });

describe("preview toggle", () => {
    it("is a light, pressed button while the preview is open", () => {
        const button = mountToggle(true).get("button");

        expect(button.attributes("aria-pressed")).toBe("true");
        expect(button.classes()).toEqual(
            expect.arrayContaining(["bg-white", "text-grey-900", "hover:bg-grey-100"]),
        );
        expect(button.classes()).not.toContain("text-white");
    });

    it("stays dark with a thin border while it is closed", () => {
        const button = mountToggle(false).get("button");

        expect(button.attributes("aria-pressed")).toBe("false");
        expect(button.classes()).toEqual(
            expect.arrayContaining(["border-grey-600", "text-white", "hover:bg-grey-700"]),
        );
        expect(button.classes()).not.toContain("bg-white");
    });

    it("flips the state on click", async () => {
        const wrapper = mount(PreviewToggle, { props: { modelValue: false } });
        await wrapper.get("button").trigger("click");

        expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
    });
});
