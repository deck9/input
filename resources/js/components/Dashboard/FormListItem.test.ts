import { flushPromises, mount } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { describe, expect, it, vi } from "vitest";
import FormListItem from "./FormListItem.vue";
import { callDuplicateForm } from "@/api/forms";

vi.mock("@/api/forms", () => ({ callDuplicateForm: vi.fn() }));

// renders every menu item without opening the menu
const stubs = {
    MenuContainer: { template: "<div><slot name='button' /><slot /></div>" },
    MenuLink: { props: ["label"], template: "<button>{{ label }}</button>" },
};

describe("form list item", () => {
    it("duplicates the form from its menu and opens the copy", async () => {
        const route = vi.fn(() => "/forms");
        window.route = route as unknown as typeof window.route;
        vi.spyOn(window, "prompt").mockReturnValue("Copy of Contact");
        vi.mocked(callDuplicateForm).mockResolvedValue({
            data: { uuid: "copy1" },
        } as AxiosResponse);

        const form = { uuid: "form1", name: "Contact" } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        await wrapper
            .findAll("button")
            .find((button) => button.text() === "Duplicate Form")
            ?.trigger("click");
        await flushPromises();

        expect(callDuplicateForm).toHaveBeenCalledWith(form, "Copy of Contact");
        expect(route).toHaveBeenLastCalledWith("forms.edit", { uuid: "copy1" });
    });

    it("shows submissions with started and finished below, without the public URL", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Customer feedback",
            completed_sessions: 6,
            total_sessions: 7,
            completion_rate: 85.71,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        const link = wrapper.find('a[href="/forms.submissions"]');
        expect(link.text()).toBe("6 submissions");
        expect(wrapper.text()).toContain("7 started · 86% finished");
        expect(wrapper.find('a[href="/forms.show"]').exists()).toBe(false);
    });

    it("says when a form has no submissions yet", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Contact",
            completed_sessions: 0,
            total_sessions: 3,
            completion_rate: 0,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        expect(wrapper.text()).toContain("No submissions yet");
        expect(wrapper.find('a[href="/forms.submissions"]').exists()).toBe(
            false,
        );
    });

    it("puts the full name in the title and lets the browser pick its direction", () => {
        const route = vi.fn(() => "/forms");
        const name = "استطلاع رضا العملاء";
        const wrapper = mount(FormListItem, {
            props: { form: { uuid: "form1", name } as FormModel },
            global: { stubs, mocks: { route } },
        });

        const link = wrapper.find(`[title="${name}"]`);
        expect(link.text()).toBe(name);
        expect(link.attributes("dir")).toBe("auto");
    });
});
