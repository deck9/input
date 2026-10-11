import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Banner from "./Banner.vue";
import { useNotice } from "@/stores/notice";

const mountBanner = () =>
    mount(Banner, {
        global: { mocks: { $page: { props: { jetstream: { flash: {} } } } } },
    });

describe("banner", () => {
    it("shows a save error until it is dismissed", async () => {
        const wrapper = mountBanner();

        // the test pinia stubs actions, so set the state directly
        useNotice().$patch({
            failedSaves: { "saveBlock:1": "Your change was not saved." },
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.get("[role=alert]").text()).toContain(
            "Your change was not saved.",
        );

        await wrapper.get("button[aria-label=Dismiss]").trigger("click");

        expect(useNotice().message).toBeNull();
        expect(wrapper.find("[role=alert]").exists()).toBe(false);
    });
});
