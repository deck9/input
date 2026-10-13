import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import FormPreview from "./FormPreview.vue";
import PreviewToggle from "./PreviewToggle.vue";

// the headlessui dialog needs it, jsdom has none
vi.stubGlobal(
    "ResizeObserver",
    class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
);

const screen = (wide: boolean) =>
    vi.stubGlobal("matchMedia", (query: string) => ({
        matches: wide && query === "(min-width: 1280px)",
        addEventListener() {},
        removeEventListener() {},
    }));

const PreviewFrame = { props: ["shown", "missed"], template: "<iframe />" };

const mountPreview = (open = true) =>
    mount(FormPreview, {
        props: { modelValue: open },
        attachTo: document.body,
        global: { stubs: { PreviewFrame } },
    });

enableAutoUnmount(afterEach);

describe("the preview panel", () => {
    afterEach(() => {
        useForm().$reset();
        useWorkbench().$reset();
    });

    it("sits beside the document on a desktop", () => {
        screen(true);
        const wrapper = mountPreview();

        const aside = wrapper.get("aside");
        expect(aside.attributes("aria-labelledby")).toBe("preview-heading");
        expect(aside.get("#preview-heading").text()).toBe("Preview");
        expect(aside.find("iframe").exists()).toBe(true);
        expect(document.querySelector("[role=dialog]")).toBeNull();
    });

    it("opens over the document on a tablet or phone", async () => {
        screen(false);
        const wrapper = mountPreview();
        await wrapper.vm.$nextTick();

        const dialog = document.querySelector("[role=dialog]");
        expect(dialog?.textContent).toContain("Preview");
        expect(dialog?.querySelector("iframe")).not.toBeNull();

        const close = [...document.querySelectorAll("button")].find(
            (button) => button.textContent?.trim() === "Close preview",
        );
        close?.click();
        expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("closes when the window gets narrower than a desktop, instead of popping over the document", async () => {
        let change: (event: { matches: boolean }) => void = () => {};
        vi.stubGlobal("matchMedia", () => ({
            matches: true,
            addEventListener: (_: string, listener: typeof change) => (change = listener),
            removeEventListener() {},
        }));
        const wrapper = mountPreview();
        expect(wrapper.find("aside").exists()).toBe(true);

        change({ matches: false });
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it.each([true, false])("says what to do for a form without questions, not a blank frame (desktop: %s)", async (wide) => {
        screen(wide);
        useForm().blocks = [];
        mountPreview();
        await flushPromises();

        expect(document.body.textContent).toContain("Add a question to see it here.");
        expect(document.querySelector("iframe")).toBeNull();

        // while the questions load, the frame
        useForm().blocks = null;
        await flushPromises();
        expect(document.body.textContent).not.toContain("Add a question");
        expect(document.querySelector("iframe")).not.toBeNull();
    });

    it("says which question it shows, and when a rule hides the open one", async () => {
        screen(true);
        const blocks = [
            { uuid: "q1", type: "input-short" },
            { uuid: "q2", type: "input-short" },
        ] as FormBlockModel[];
        useForm().blocks = blocks;
        useWorkbench().block = blocks[1];
        const wrapper = mountPreview();
        const frame = wrapper.findComponent(PreviewFrame);

        frame.vm.$emit("update:shown", "q1");
        await flushPromises();
        expect(wrapper.get("#preview-heading").text()).toBe("Preview · question 1");
        expect(wrapper.text()).not.toContain("hidden by a rule");

        frame.vm.$emit("update:missed", "q2");
        await flushPromises();
        expect(wrapper.get("aside").text()).toContain(
            "Question 2 is hidden by a rule, so the preview can't jump to it.",
        );

        // once another question is open, the line goes
        useWorkbench().block = blocks[0];
        await flushPromises();
        expect(wrapper.text()).not.toContain("hidden by a rule");
    });

    // the public form leaves them out, so no rule is to blame
    it.each([
        ["a hidden question", { is_disabled: true }, "is hidden"],
        ["a question in a hidden group", { parent_block: "g1" }, "is in a hidden group"],
    ])("says when the open one is %s", async (_, question, reason) => {
        screen(false);
        const blocks = [
            { uuid: "q1", type: "input-short", parent_block: null },
            { uuid: "g1", type: "group", parent_block: null, is_disabled: true },
            { uuid: "q2", type: "input-short", parent_block: null, ...question },
        ] as FormBlockModel[];
        useForm().blocks = blocks;
        useWorkbench().block = blocks[2];
        const wrapper = mountPreview();
        await flushPromises();

        wrapper.findComponent(PreviewFrame).vm.$emit("update:missed", "q2");
        await flushPromises();

        expect(document.querySelector("[role=dialog]")?.textContent).toContain(
            `Question 2 ${reason}, so the preview can't jump to it.`,
        );
    });

    it.each([true, false])("shows nothing when closed (desktop: %s)", (wide) => {
        screen(wide);
        const wrapper = mountPreview(false);

        expect(wrapper.find("aside").exists()).toBe(false);
        expect(document.querySelector("[role=dialog]")).toBeNull();
    });
});

describe("the Preview button in the top bar", () => {
    it("shows and hides the preview", async () => {
        const wrapper = mount(PreviewToggle, {
            props: {
                modelValue: false,
                "onUpdate:modelValue": (open: boolean) =>
                    wrapper.setProps({ modelValue: open }),
            },
        });
        const button = wrapper.get("button");

        expect(button.text()).toBe("Preview");
        expect(button.attributes("aria-pressed")).toBe("false");

        await button.trigger("click");
        expect(button.attributes("aria-pressed")).toBe("true");

        await button.trigger("click");
        expect(button.attributes("aria-pressed")).toBe("false");
    });
});
