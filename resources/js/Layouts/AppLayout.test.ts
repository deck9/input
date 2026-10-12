import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AppLayout from "./AppLayout.vue";
import { useForm } from "@/stores";

const $page = {
    props: {
        auth: { user: { name: "Ole", current_team: { name: "Ole's Studio" } } },
        jetstream: {},
    },
};

const mountLayout = () =>
    mount(AppLayout, {
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

describe("app header", () => {
    // jsdom has no media queries, so check that no width hides them
    it("keeps the logo, the team name and a named account menu on phones", () => {
        const wrapper = mountLayout();
        const team = wrapper.get("nav a");
        const account = wrapper.get("nav button");

        expect(team.text()).toBe("Ole's Studio");
        expect(team.element.closest(".hidden")).toBeNull();
        expect(team.find("span").classes()).toContain("truncate");
        // an Arabic or Hebrew name keeps its start when it's cut
        expect(team.find("span").attributes("dir")).toBe("auto");
        expect(account.text().replace(/\s+/g, " ")).toContain("Account: Ole");
        expect(account.find(".hidden").exists()).toBe(false);
    });

    it("leaves the logo out on phones on a form's pages, where the form navigation fills the header", async () => {
        const wrapper = mountLayout();
        // the test pinia stubs actions, so set the state directly
        useForm().$patch({ form: { uuid: "form1" } as FormModel });
        await wrapper.vm.$nextTick();

        expect(wrapper.get("nav a").element.closest(".hidden")).not.toBeNull();
        expect(wrapper.get("nav a").element.closest(".sm\\:flex")).not.toBeNull();
    });
});
