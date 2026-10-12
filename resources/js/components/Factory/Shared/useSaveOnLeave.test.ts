import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useSaveOnLeave } from "./useSaveOnLeave";
import { useNotice } from "@/stores/notice";
import { useWorkbench } from "@/stores/workbench";

let wrapper: VueWrapper;
const leave = () => {
    const event = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(event);
    return event;
};

// the test pinia stubs actions, so set the state directly
describe("leaving the editor", () => {
    beforeEach(() => {
        useNotice().$reset();
        vi.clearAllMocks();
        wrapper = mount(
            defineComponent({
                setup: () => useSaveOnLeave(),
                template: "<div />",
            }),
        );
    });

    afterEach(() => wrapper.unmount());

    it("sends waiting saves at once when the page goes away", () => {
        window.dispatchEvent(new Event("pagehide"));

        expect(useWorkbench().flushSaves).toHaveBeenCalled();
    });

    it("leaves without asking when everything is saved", () => {
        expect(leave().defaultPrevented).toBe(false);
        expect(useWorkbench().flushSaves).toHaveBeenCalled();
    });

    it("asks before leaving while a save waits", () => {
        useNotice().$patch({ waitingSaves: { "saveBlock:1": true } });

        expect(leave().defaultPrevented).toBe(true);
    });

    it("asks before leaving while a save failed", () => {
        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
        });

        expect(leave().defaultPrevented).toBe(true);
    });
});
