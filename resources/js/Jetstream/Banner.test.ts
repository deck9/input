import { mount, VueWrapper } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import Banner from "./Banner.vue";
import { useNotice } from "@/stores/notice";

const retry = (wrapper: VueWrapper) =>
    wrapper.findAll("[role=alert] button").find((b) => b.text() === "Retry");
const mountBanner = () =>
    mount(Banner, {
        global: { mocks: { $page: { props: { jetstream: { flash: {} } } } } },
    });

describe("banner", () => {
    it("shows a save error until it is dismissed", async () => {
        const wrapper = mountBanner();

        // the test pinia stubs actions, so set the state directly
        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change wasn't saved." },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.get("[role=alert]").text()).toContain(
            "Your change wasn't saved.",
        );

        await wrapper.get("button[aria-label=Dismiss]").trigger("click");

        expect(useNotice().message).toBeNull();
        expect(wrapper.find("[role=alert]").exists()).toBe(false);
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
