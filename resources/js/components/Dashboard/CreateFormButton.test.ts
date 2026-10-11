import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@inertiajs/vue3";
import CreateFormButton from "./CreateFormButton.vue";
import { callCreateForm, callCreateFormFromTemplate } from "@/api/forms";

vi.mock("@/api/forms", () => ({
    callCreateForm: vi.fn(),
    callCreateFormFromTemplate: vi.fn(),
}));

vi.mock("@inertiajs/vue3", () => ({ router: { visit: vi.fn() } }));

let wrapper: VueWrapper | undefined;

// the dialog is teleported to the body
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");
const nameInput = () => dialog()?.querySelector("input") as HTMLInputElement;
const dialogButton = (label: string) =>
    dialog()?.querySelector(`button[aria-label="${label}"]`) as HTMLElement;

const typeName = async (name: string) => {
    nameInput().value = name;
    nameInput().dispatchEvent(new Event("input"));
    await flushPromises();
};

const openCreateDialog = async () => {
    wrapper = mount(CreateFormButton, { attachTo: document.body });
    await wrapper.find('button[aria-label="Create form"]').trigger("click");
    await flushPromises();
};

const pickTemplate = async (content: string, name = "template.json") => {
    wrapper = mount(CreateFormButton, { attachTo: document.body });
    const input = wrapper.find("input[type=file]");
    const file = new File([content], name, {
        type: "application/json",
    });
    // jsdom has no Blob.text()
    file.text = () => Promise.resolve(content);
    Object.defineProperty(input.element, "files", { value: [file] });

    await input.trigger("change");
    await flushPromises();

    return { wrapper, file };
};

beforeEach(() => {
    vi.clearAllMocks();
    window.route = vi.fn(
        (name: string, params: Record<string, string>) =>
            `${name}:${params.id}`,
    ) as unknown as typeof window.route;
});

afterEach(() => {
    wrapper?.unmount();
});

describe("create a form", () => {
    it("asks for the name in a dialog with the field focused", async () => {
        await openCreateDialog();

        expect(dialog()?.textContent).toContain("Create form");
        expect(dialog()?.querySelector("label")?.textContent).toBe(
            "Form name",
        );
        expect(document.activeElement).toBe(nameInput());
        expect(callCreateForm).not.toHaveBeenCalled();
    });

    it("creates no form on Cancel", async () => {
        await openCreateDialog();
        dialogButton("Cancel").click();
        await flushPromises();

        expect(dialog()).toBeNull();
        expect(callCreateForm).not.toHaveBeenCalled();
    });

    it("creates no form on Esc", async () => {
        await openCreateDialog();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await flushPromises();

        expect(dialog()).toBeNull();
        expect(callCreateForm).not.toHaveBeenCalled();
    });

    it("creates the form with the name on Enter and opens it", async () => {
        vi.mocked(callCreateForm).mockResolvedValue({
            status: 200,
            data: { uuid: "new1" },
        } as AxiosResponse);

        await openCreateDialog();
        await typeName("Customer feedback");
        // Enter in the only text field submits its form
        dialog()?.querySelector("form")?.dispatchEvent(new Event("submit"));
        await flushPromises();

        expect(callCreateForm).toHaveBeenCalledWith("Customer feedback");
        expect(router.visit).toHaveBeenCalledWith("forms.edit:new1");
    });

    it("leaves an empty name to the server's default", async () => {
        vi.mocked(callCreateForm).mockResolvedValue({
            status: 200,
            data: { uuid: "new1" },
        } as AxiosResponse);

        await openCreateDialog();
        await typeName("  ");
        dialogButton("Create form").click();
        await flushPromises();

        expect(callCreateForm).toHaveBeenCalledWith(undefined);
    });

    it("shows the button loading and keeps the dialog open while saving", async () => {
        vi.mocked(callCreateForm).mockReturnValue(new Promise(() => {}));

        await openCreateDialog();
        dialogButton("Create form").click();
        await flushPromises();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await flushPromises();

        expect(dialogButton("Create form").getAttribute("aria-busy")).toBe(
            "true",
        );
        expect(dialog()).not.toBeNull();
    });
});

describe("create a form from a template", () => {
    it("names the form after the file and opens it", async () => {
        vi.mocked(callCreateFormFromTemplate).mockResolvedValue({
            status: 201,
            data: { uuid: "new1" },
        } as AxiosResponse);

        const { wrapper, file } = await pickTemplate(
            '{"blocks": []}',
            "Contact.json",
        );

        expect(nameInput().value).toBe("Contact");
        dialogButton("Create form").click();
        await flushPromises();

        expect(callCreateFormFromTemplate).toHaveBeenCalledWith(file, "Contact");
        expect(router.visit).toHaveBeenCalledWith("forms.edit:new1");
        expect(wrapper.text()).not.toContain("Something went wrong");
    });

    it("creates no form when the name dialog is cancelled", async () => {
        await pickTemplate('{"blocks": []}');
        dialogButton("Cancel").click();
        await flushPromises();

        expect(callCreateFormFromTemplate).not.toHaveBeenCalled();
    });

    it("shows the message of a refused template and opens no form", async () => {
        const message = "The cta link field format is invalid.";
        vi.mocked(callCreateFormFromTemplate).mockRejectedValue(
            new AxiosError(message, undefined, undefined, undefined, {
                status: 422,
                data: { message },
            } as AxiosResponse),
        );

        const { wrapper } = await pickTemplate('{"blocks": []}');
        dialogButton("Create form").click();
        await flushPromises();

        expect(dialog()).toBeNull();
        expect(wrapper.text()).toContain(message);
        expect(router.visit).not.toHaveBeenCalled();
    });

    it("shows a general error for a file that is not JSON and creates no form", async () => {
        const { wrapper } = await pickTemplate("not json");

        expect(dialog()).toBeNull();
        expect(callCreateFormFromTemplate).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain(
            "This file could not be imported as a template.",
        );
    });
});
