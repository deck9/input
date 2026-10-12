import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWorkbench } from "@/stores";
import QuestionCard from "./QuestionCard.vue";

const block = {
    id: 4,
    uuid: "q4",
    type: "input-short",
    message: "<p>Your name?</p>",
} as FormBlockModel;

const stubs = {
    Editor: true,
    BlockMenu: true,
    QuestionSettings: { props: ["id"], template: `<div :id="id">settings</div>` },
};

let wrapper: VueWrapper | undefined;

const mountCard = (phone: boolean) => {
    window.matchMedia = vi.fn().mockReturnValue({
        matches: phone,
        addEventListener: () => {},
        removeEventListener: () => {},
    });
    wrapper = mount(QuestionCard, {
        props: { block, number: 4 },
        global: { stubs },
        attachTo: document.body,
    });
    return wrapper;
};
const settingsButton = () =>
    wrapper!.findAll("button").find((b) => b.text() === "Settings")!;

describe("a question's settings", () => {
    beforeEach(() => {
        globalThis.ResizeObserver ??= class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
        useWorkbench().$reset();
    });

    afterEach(() => wrapper?.unmount());

    it("open inside the card on a wider screen", async () => {
        mountCard(false);
        await settingsButton().trigger("click");

        expect(wrapper!.text()).toContain("settings");
        expect(document.querySelector("[role=dialog]")).toBeNull();
    });

    it("open as a bottom sheet on a phone, and Done closes it", async () => {
        mountCard(true);
        await settingsButton().trigger("click");
        await flushPromises();

        const sheet = document.querySelector("[role=dialog]");
        expect(sheet?.textContent).toContain("Question 4 settings");
        expect(sheet?.textContent).toContain("settings");

        const done = [...sheet!.querySelectorAll("button")].find(
            (b) => b.textContent?.trim() === "Done",
        );
        done!.click();
        await flushPromises();

        expect(document.querySelector("[role=dialog]")).toBeNull();
    });
});
