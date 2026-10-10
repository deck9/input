import { flushPromises, mount } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@inertiajs/vue3";
import CreateFormButton from "./CreateFormButton.vue";
import { callCreateFormFromTemplate } from "@/api/forms";

vi.mock("@/api/forms", () => ({
    callCreateForm: vi.fn(),
    callCreateFormFromTemplate: vi.fn(),
}));

vi.mock("@inertiajs/vue3", () => ({ router: { visit: vi.fn() } }));

const pickTemplate = async (content: string) => {
    const wrapper = mount(CreateFormButton);
    const input = wrapper.find("input[type=file]");
    const file = new File([content], "template.json", {
        type: "application/json",
    });
    // jsdom has no Blob.text()
    file.text = () => Promise.resolve(content);
    Object.defineProperty(input.element, "files", { value: [file] });

    await input.trigger("change");
    await flushPromises();

    return { wrapper, file };
};

describe("create a form from a template", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.route = vi.fn(
            (name: string, params: Record<string, string>) =>
                `${name}:${params.id}`,
        ) as unknown as typeof window.route;
        vi.spyOn(window, "prompt").mockReturnValue("Contact");
    });

    it("creates the form from the file and opens it", async () => {
        vi.mocked(callCreateFormFromTemplate).mockResolvedValue({
            status: 201,
            data: { uuid: "new1" },
        } as AxiosResponse);

        const { wrapper, file } = await pickTemplate('{"blocks": []}');

        expect(callCreateFormFromTemplate).toHaveBeenCalledWith(file, "Contact");
        expect(router.visit).toHaveBeenCalledWith("forms.edit:new1");
        expect(wrapper.text()).not.toContain("Something went wrong");
    });

    it("creates no form when the name prompt is cancelled", async () => {
        vi.mocked(window.prompt).mockReturnValue(null);

        await pickTemplate('{"blocks": []}');

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

        expect(wrapper.text()).toContain(message);
        expect(router.visit).not.toHaveBeenCalled();
    });

    it("shows a general error for a file that is not JSON and creates no form", async () => {
        const { wrapper } = await pickTemplate("not json");

        expect(callCreateFormFromTemplate).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain(
            "This file could not be imported as a template.",
        );
    });
});
