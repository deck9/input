import { mount, VueWrapper } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Banner from "./Banner.vue";
import { useNotice } from "@/stores/notice";

const retry = (wrapper: VueWrapper) =>
    wrapper.findAll("[role=alert] button").find((b) => b.text() === "Retry");
const mountBanner = (flash = {}) =>
    mount(Banner, {
        global: { mocks: { $page: { props: { jetstream: { flash } } } } },
    });

describe("banner", () => {
    beforeEach(() => useNotice().$reset());

    it("hides a save error when dismissed, but keeps the failed save", async () => {
        const wrapper = mountBanner();

        // the test pinia stubs actions, so set the state directly
        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
            retries: { "saveBlock:1": vi.fn() },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.get("[role=alert]").text()).toContain(
            "Your change wasn't saved.",
        );

        await wrapper.get("button[aria-label=Dismiss]").trigger("click");

        expect(wrapper.find("[role=alert]").exists()).toBe(false);
        // "Not saved" with Retry and the leave prompt still need it
        expect(useNotice().saveStatus).toBe("failed");
        expect(useNotice().canRetry).toBe(true);
    });

    // below lg the bar is the only sign of a failed save
    it("keeps the close button off phones while a save failed", async () => {
        const wrapper = mountBanner();

        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
            retries: { "saveBlock:1": vi.fn() },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.get("button[aria-label=Dismiss]").classes()).toContain(
            "max-lg:hidden",
        );
    });

    // e.g. settings pages: without Retry the bar would never go away
    it("lets phones close a failed save that has no Retry", async () => {
        const wrapper = mountBanner();

        useNotice().$patch({
            failedSaves: { saveSettings: "Your settings weren't saved." },
        });
        await wrapper.vm.$nextTick();

        expect(
            wrapper.get("button[aria-label=Dismiss]").classes(),
        ).not.toContain("max-lg:hidden");
    });

    it("lets phones close any other banner", () => {
        const wrapper = mountBanner({ banner: "Saved." });

        expect(
            wrapper.get("button[aria-label=Dismiss]").classes(),
        ).not.toContain("max-lg:hidden");
    });

    it("offers Retry for a save that can be sent again", async () => {
        const wrapper = mountBanner();

        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
        });
        await wrapper.vm.$nextTick();
        expect(retry(wrapper)).toBeUndefined();

        useNotice().$patch({ retries: { "saveBlock:1": vi.fn() } });
        await wrapper.vm.$nextTick();
        await retry(wrapper)!.trigger("click");

        expect(useNotice().retrySaves).toHaveBeenCalled();
        wrapper.unmount();
    });
});
