import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FactoryNavigation from "./FactoryNavigation.vue";
import FactoryNavigationRows from "./FactoryNavigationRows.vue";
import { useForm } from "@/stores";

// every route points to /<name>, so the current page is set by the url
const route = (name: string) => `${location.origin}/${name}`;
window.route = route as typeof window.route;

const mountOnPage = async (component, page: string) => {
    history.replaceState(null, "", `/${page}`);

    const wrapper = mount(component, {
        global: {
            mocks: { route },
            stubs: { Link: { template: "<a><slot /></a>" } },
        },
    });
    // the test pinia stubs actions, so set the state directly
    useForm().$patch({
        form: { uuid: "form1", name: "Customer feedback" } as FormModel,
    });
    await wrapper.vm.$nextTick();

    return wrapper;
};

describe("form navigation under xl", () => {
    it("shows the form's pages as 4 labeled tabs and marks the current one by more than color", async () => {
        const wrapper = await mountOnPage(FactoryNavigationRows, "forms.settings");
        const tabs = wrapper.get('ul[role="list"][aria-label="Form pages"]').findAll("a");

        expect(wrapper.classes()).toContain("xl:hidden");
        expect(tabs.map((tab) => tab.text())).toEqual([
            "Editor",
            "Settings",
            "Integrations",
            "Submissions",
        ]);

        const current = tabs.filter((tab) => tab.attributes("aria-current"));
        expect(current).toHaveLength(1);
        expect(current[0].attributes("aria-current")).toBe("page");
        expect(current[0].text()).toBe("Settings");
        expect(current[0].find(".bg-blue-500").exists()).toBe(true);
    });

    it("names the icon-only Back and Preview links and keeps the form menu", async () => {
        const wrapper = await mountOnPage(FactoryNavigationRows, "forms.edit");

        const back = wrapper.get('a[aria-label="Dashboard"]');
        expect(back.attributes("href")).toBe(route("dashboard"));

        const preview = wrapper.get('a[aria-label="Preview (opens in a new tab)"]');
        expect(preview.attributes("target")).toBe("_blank");
        expect(preview.attributes("rel")).toBe("noopener");

        expect(wrapper.get("button").text()).toContain("Customer feedback");
    });
});

describe("form navigation from xl", () => {
    it("stays in the header and tells screen readers the current page", async () => {
        const wrapper = await mountOnPage(FactoryNavigation, "forms.integrations");

        expect(wrapper.classes()).toEqual(
            expect.arrayContaining(["hidden", "xl:flex"]),
        );
        const current = wrapper.findAll('a[aria-current="page"]');
        expect(current).toHaveLength(1);
        expect(current[0].text()).toBe("Integrations");
    });
});
