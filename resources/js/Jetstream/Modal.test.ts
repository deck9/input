import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent, h, ref } from "vue";
import Modal from "./Modal.vue";

// a page with a button behind the dialog
const Page = defineComponent({
    setup() {
        const show = ref(false);
        const close = () => (show.value = false);

        return () => [
            h("button", { id: "open", onClick: () => (show.value = true) }),
            h(Modal, { show: show.value, onClose: close }, () => [
                h("input", { id: "name" }),
                h("button", { id: "cancel", onClick: close }),
                h("button", { id: "save" }),
            ]),
            h("button", { id: "behind" }),
        ];
    },
});

let wrapper: VueWrapper | undefined;

const byId = (id: string) => document.getElementById(id) as HTMLElement;

const openDialog = async () => {
    wrapper = mount(Page, { attachTo: document.body });
    byId("open").focus();
    byId("open").click();
    await flushPromises();
};

// jsdom doesn't move the focus on Tab: only the dialog does
const pressTab = (shiftKey = false) => {
    const event = new KeyboardEvent("keydown", {
        key: "Tab",
        shiftKey,
        bubbles: true,
        cancelable: true,
    });
    document.activeElement?.dispatchEvent(event);
    return event;
};

afterEach(() => {
    wrapper?.unmount();
});

describe("Modal focus", () => {
    it("moves the focus into the dialog when it opens", async () => {
        await openDialog();

        expect(document.activeElement).toBe(byId("name"));
    });

    it("goes from the last control back to the first on Tab", async () => {
        await openDialog();
        byId("save").focus();

        const event = pressTab();

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(byId("name"));
    });

    it("goes from the first control to the last on Shift+Tab", async () => {
        await openDialog();

        const event = pressTab(true);

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(byId("save"));
    });

    it("leaves Tab alone between the dialog's controls", async () => {
        await openDialog();

        expect(pressTab().defaultPrevented).toBe(false);
    });

    it("brings the focus back from the page into the dialog", async () => {
        await openDialog();
        byId("behind").focus();

        pressTab();

        expect(document.activeElement).toBe(byId("name"));
    });

    it("gives the focus back to the opener on close", async () => {
        await openDialog();
        byId("cancel").focus();
        byId("cancel").click();
        await flushPromises();

        expect(document.activeElement).toBe(byId("open"));
    });

    it("gives the focus back to the opener on Escape", async () => {
        await openDialog();
        byId("save").focus();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await flushPromises();

        expect(document.activeElement).toBe(byId("open"));
    });

    it("keeps the focus where the page moved it on close", async () => {
        await openDialog();
        byId("behind").focus();
        byId("cancel").click();
        await flushPromises();

        expect(document.activeElement).toBe(byId("behind"));
    });

    it("lets Tab through when no dialog is open", async () => {
        wrapper = mount(Page, { attachTo: document.body });
        byId("open").focus();

        expect(pressTab().defaultPrevented).toBe(false);
    });
});
