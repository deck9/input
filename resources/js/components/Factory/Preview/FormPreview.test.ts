import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useForm } from "@/stores";
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

const mountPreview = (open = true) =>
    mount(FormPreview, {
        props: { modelValue: open },
        attachTo: document.body,
        global: { stubs: { PreviewFrame: { template: "<iframe />" } } },
    });

enableAutoUnmount(afterEach);

describe("the preview panel", () => {
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
