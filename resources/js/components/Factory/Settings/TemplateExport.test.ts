import { flushPromises, mount } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TemplateExport from "./TemplateExport.vue";
import { callImportFormTemplate } from "@/api/forms";
import { useForm } from "@/stores";

vi.mock("@/api/forms", () => ({
    callGetFormTemplate: vi.fn().mockResolvedValue({ data: {} }),
    callImportFormTemplate: vi.fn(),
}));

const importFile = async (content: string) => {
    const wrapper = mount(TemplateExport);
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

const serverError = (status: number, message: string) =>
    new AxiosError(message, undefined, undefined, undefined, {
        status,
        data: { message },
    } as AxiosResponse);

describe("template import", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useForm().form = { uuid: "form1" } as FormModel;
    });

    it("imports a valid template and reloads the form", async () => {
        vi.mocked(callImportFormTemplate).mockResolvedValue({
            status: 200,
        } as AxiosResponse);

        const { wrapper, file } = await importFile('{"blocks": []}');

        expect(callImportFormTemplate).toHaveBeenCalledWith("form1", file);
        expect(useForm().refreshForm).toHaveBeenCalled();
        expect(wrapper.text()).not.toContain("Something went wrong");
    });

    it.each([
        "The cta link field format is invalid.",
        "This form already has submissions. Import the template into a new form instead.",
    ])("shows the message of a refused import: %s", async (message) => {
        vi.mocked(callImportFormTemplate).mockRejectedValue(
            serverError(422, message),
        );

        const { wrapper } = await importFile('{"blocks": []}');

        expect(wrapper.text()).toContain(message);
        expect(useForm().refreshForm).not.toHaveBeenCalled();
    });

    it("shows a general error for a file that is not JSON", async () => {
        const { wrapper } = await importFile("not json");

        expect(callImportFormTemplate).not.toHaveBeenCalled();
        expect(wrapper.text()).toContain(
            "This file could not be imported as a template.",
        );
    });

    it("shows a general error when the server fails", async () => {
        vi.mocked(callImportFormTemplate).mockRejectedValue(
            serverError(500, "SQLSTATE[42S02]: Base table not found"),
        );

        const { wrapper } = await importFile('{"blocks": []}');

        expect(wrapper.text()).not.toContain("SQLSTATE");
        expect(wrapper.text()).toContain(
            "This file could not be imported as a template.",
        );
    });
});
