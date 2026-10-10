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
});
