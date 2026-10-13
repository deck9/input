import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import TypePicker from "./TypePicker.vue";

let wrapper: VueWrapper | undefined;

const mountPicker = (large = true) => {
    window.matchMedia = vi.fn().mockReturnValue({
        matches: large,
        addEventListener: () => {},
        removeEventListener: () => {},
    });
    wrapper = mount(TypePicker, {
        props: { title: "Add a question" },
        global: {
            stubs: {
                Icon: { props: ["name"], template: `<i :data-icon="name" />` },
            },
        },
        attachTo: document.body,
    });
    return wrapper;
};
const options = () => wrapper!.findAll("[role=option]");
const optionTexts = () => options().map((option) => option.text());

describe("the answer type picker", () => {
    afterEach(() => wrapper?.unmount());

    it("groups the answer types, with one icon per type", () => {
        const groups = mountPicker()
            .findAll("[role=listbox] [role=group]")
            .map((group) => [
                group.attributes("aria-label"),
                group.findAll("[role=option]").map((option) => option.text()),
            ]);

        expect(groups).toEqual([
            [
                "Text",
                [
                    "Short text",
                    "Long text",
                    "Email",
                    "Link",
                    "Phone",
                    "Number",
                    "Hidden text",
                ],
            ],
            ["Choice", ["Single choice", "Checkboxes"]],
            ["Rating", ["Rating", "Scale"]],
            ["Other", ["Date", "File upload", "Consent"]],
            ["Content", ["Text only"]],
        ]);

        const icons = options().map((option) =>
            option.find("[data-icon]").attributes("data-icon"),
        );
        expect(new Set(icons).size).toBe(15);
    });

    it("takes the cursor, filters as you type and adds the highlighted type with Enter", async () => {
        const input = mountPicker().find("input");
        expect(document.activeElement).toBe(input.element);

        await input.setValue("che");
        expect(optionTexts()).toEqual(["Checkboxes"]);

        await input.setValue("");
        await input.trigger("keydown", { key: "ArrowDown" });
        expect(input.attributes("aria-activedescendant")).toBe(
            options()[1].attributes("id"),
        );
        expect(options()[1].attributes("aria-selected")).toBe("true");
        expect(options()[1].classes()).toContain("ring-2");

        await input.trigger("keydown", { key: "Enter" });
        expect(wrapper!.emitted("pick")).toEqual([["input-long"]]);
    });

    it("leaves the search to a tap on a phone, where the keyboard would cover the list", () => {
        mountPicker(false);

        expect(document.activeElement?.textContent?.trim()).toBe(
            "Add a question",
        );
        expect(options()[0].attributes("aria-selected")).toBe("true");
        expect(options()[0].classes()).not.toContain("ring-2");
    });

    it("adds a type on click and closes on Escape", async () => {
        mountPicker();

        await options()
            .find((option) => option.text() === "Single choice")!
            .trigger("click");
        expect(wrapper!.emitted("pick")).toEqual([["radio"]]);

        await wrapper!.find("input").trigger("keydown", { key: "Escape" });
        expect(wrapper!.emitted("close")).toHaveLength(1);
    });

    it("says so when no type matches", async () => {
        await mountPicker().find("input").setValue("xyz");

        expect(options()).toHaveLength(0);
        expect(wrapper!.text()).toContain("No answer type matches");
    });
});
