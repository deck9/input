import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import Banner from "./Banner.vue";
import { useNotice } from "@/stores/notice";

const mountBanner = () =>
    mount(Banner, {
        global: { mocks: { $page: { props: { jetstream: { flash: {} } } } } },
    });

describe("banner", () => {
    beforeEach(() => setActivePinia(createPinia()));

    it("shows a save error until it is dismissed", async () => {
        const wrapper = mountBanner();

        useNotice().message = "Your change was not saved.";
        await wrapper.vm.$nextTick();

        expect(wrapper.get("[role=alert]").text()).toContain(
            "Your change was not saved.",
        );

        await wrapper.get("button[aria-label=Dismiss]").trigger("click");

        expect(useNotice().message).toBeNull();
        expect(wrapper.find("[role=alert]").exists()).toBe(false);
    });
});
