import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppLayout from "./AppLayout.vue";

const $page = {
    props: {
        auth: { user: { name: "Ole", current_team: { name: "Ole's Studio" } } },
        jetstream: {},
    },
};

describe("app header", () => {
    // jsdom has no media queries, so check that no width hides them
    it("keeps the logo, the team name and a named account menu on phones", () => {
        const wrapper = mount(AppLayout, {
            props: { title: "Forms" },
            global: {
                mocks: { $page, route: () => "/" },
                stubs: {
                    Head: true,
                    Link: { template: "<a><slot /></a>" },
                    FactoryNavigation: true,
                    JetBanner: true,
                },
            },
        });
        const team = wrapper.get("nav a");
        const account = wrapper.get("nav button");

        expect(team.text()).toBe("Ole's Studio");
        expect(team.element.closest(".hidden")).toBeNull();
        expect(team.find("span").classes()).toContain("truncate");
        expect(account.text()).toContain("Ole");
        expect(account.find(".hidden").exists()).toBe(false);
    });
});
