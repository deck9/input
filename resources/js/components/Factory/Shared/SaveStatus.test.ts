import { mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SaveStatus from "./SaveStatus.vue";
import { useNotice } from "@/stores/notice";

let wrapper: VueWrapper;
const live = () => wrapper.get("[aria-live=polite]");
const retry = () => wrapper.findAll("button").find((b) => b.text() === "Retry");

// the test pinia stubs actions, so set the state directly
describe("save status", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useNotice().$reset();
        wrapper = mount(SaveStatus);
    });

    afterEach(() => {
        wrapper.unmount();
        vi.useRealTimers();
    });

    it("says Saving… while a save runs, then Saved for 2 seconds", async () => {
        expect(live().text()).toBe("");

        useNotice().$patch({ runningSaves: 1 });
        await wrapper.vm.$nextTick();
        expect(live().text()).toBe("Saving…");

        useNotice().$patch({ runningSaves: 0 });
        await wrapper.vm.$nextTick();
        expect(live().text()).toBe("Saved");

        vi.advanceTimersByTime(2000);
        await wrapper.vm.$nextTick();
        expect(live().text()).toBe("");
    });

    it("says Not saved with Retry when a save failed", async () => {
        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
            retries: { "saveBlock:1": vi.fn() },
        });
        await wrapper.vm.$nextTick();

        expect(live().text()).toBe("Not saved");
        await retry()!.trigger("click");
        expect(useNotice().retrySaves).toHaveBeenCalled();
    });

    it("shows no Saved after a failed save", async () => {
        useNotice().$patch({ runningSaves: 1 });
        await wrapper.vm.$nextTick();
        useNotice().$patch({
            runningSaves: 0,
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
        });
        await wrapper.vm.$nextTick();

        expect(live().text()).toBe("Not saved");
        expect(retry()).toBeUndefined();
    });
});
