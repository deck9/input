import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormListItem from "./FormListItem.vue";
import { callDuplicateForm } from "@/api/forms";

vi.mock("@/api/forms", () => ({ callDuplicateForm: vi.fn() }));

// renders every menu item without opening the menu
const stubs = {
    MenuContainer: { template: "<div><slot name='button' /><slot /></div>" },
    MenuLink: { props: ["label"], template: "<button>{{ label }}</button>" },
};

const route = vi.fn(() => "/forms");
let wrapper: VueWrapper | undefined;

// the dialog is teleported to the body
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");
const nameInput = () => dialog()?.querySelector("input") as HTMLInputElement;
const dialogButton = (label: string) =>
    dialog()?.querySelector(`button[aria-label="${label}"]`) as HTMLElement;

const openDuplicateDialog = async (form: FormModel) => {
    wrapper = mount(FormListItem, {
        props: { form },
        global: { stubs, mocks: { route } },
        attachTo: document.body,
    });

    await wrapper
        .findAll("button")
        .find((button) => button.text() === "Duplicate Form")
        ?.trigger("click");
    await flushPromises();
};

describe("duplicate a form", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.route = route as unknown as typeof window.route;
        vi.mocked(callDuplicateForm).mockResolvedValue({
            data: { uuid: "copy1" },
        } as AxiosResponse);
    });

    afterEach(() => {
        wrapper?.unmount();
    });

    it("asks for the name with the copy's name prefilled and focused", async () => {
        await openDuplicateDialog({ uuid: "form1", name: "Contact" } as FormModel);

        expect(dialog()?.textContent).toContain("Duplicate form");
        expect(dialog()?.querySelector("label")?.textContent).toBe("Name");
        expect(nameInput().value).toBe("Contact (copy)");
        expect(document.activeElement).toBe(nameInput());
    });

    it("cuts the prefilled name to 255 characters", async () => {
        await openDuplicateDialog({
            uuid: "form1",
            name: "🎉".repeat(255),
        } as FormModel);

        expect(Array.from(nameInput().value)).toHaveLength(255);
    });

    it("duplicates the form with the name and opens the copy", async () => {
        const form = { uuid: "form1", name: "Contact" } as FormModel;
        await openDuplicateDialog(form);
        dialogButton("Duplicate").click();
        await flushPromises();

        expect(callDuplicateForm).toHaveBeenCalledWith(form, "Contact (copy)");
        expect(route).toHaveBeenLastCalledWith("forms.edit", { uuid: "copy1" });
    });

    it("creates no copy on Cancel", async () => {
        await openDuplicateDialog({ uuid: "form1", name: "Contact" } as FormModel);
        dialogButton("Cancel").click();
        await flushPromises();

        expect(dialog()).toBeNull();
        expect(callDuplicateForm).not.toHaveBeenCalled();
    });
});
