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
                FormTopBar: true,
                FormPageTabs: true,
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

    it("keeps today's header on the dashboard, without the form bar", () => {
        const wrapper = mountLayout();
        useForm().$patch({ form: null });

        expect(wrapper.find("nav.bg-grey-800").exists()).toBe(true);
        expect(wrapper.find("form-top-bar-stub").exists()).toBe(false);
        expect(wrapper.find("form-page-tabs-stub").exists()).toBe(false);
    });

    it("swaps the header for one form bar and a phone tab bar on a form's pages", async () => {
        const wrapper = mountLayout();
        // the test pinia stubs actions, so set the state directly
        useForm().$patch({ form: { uuid: "form1" } as FormModel });
        await wrapper.vm.$nextTick();

        expect(wrapper.find("nav.bg-grey-800").exists()).toBe(false);
        expect(wrapper.findAll("form-top-bar-stub")).toHaveLength(1);
        // after the page, so it sits at the bottom
        expect(wrapper.get("main + form-page-tabs-stub").attributes("placement")).toBe(
            "bottom",
        );
    });

    it("links a draft's bar to its form in a new tab, until the live preview fills the slot", async () => {
        window.route = ((name: string) => `/${name}`) as typeof window.route;
        // the real bar, without its menus
        const wrapper = mount(AppLayout, {
            props: { title: "Form Settings" },
            global: {
                mocks: { $page, route: () => "/" },
                stubs: {
                    Head: true,
                    Link: true,
                    JetBanner: true,
                    FormMenu: true,
                    FormPageTabs: true,
                    PublishControl: true,
                    AccountMenu: true,
                },
            },
        });
        useForm().$patch({ form: { uuid: "form1", is_published: false } as FormModel });
        await wrapper.vm.$nextTick();

        const preview = wrapper.get("header a[target='_blank']");
        expect(preview.attributes("href")).toBe("/forms.show");
        expect(preview.get("span").text()).toBe("Preview");
        expect(preview.text()).toContain("(opens in a new tab)");
        // on phones it's in the form menu: the name keeps its room
        expect(preview.classes()).toEqual(expect.arrayContaining(["hidden", "lg:flex"]));
    });
});
