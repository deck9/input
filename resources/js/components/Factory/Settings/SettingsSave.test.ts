import { flushPromises, mount } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Appearance from "./Appearance.vue";
import Options from "./Options.vue";
import { callUpdateForm } from "@/api/forms";
import { useForm } from "@/stores";
import { useNotice } from "@/stores/notice";

vi.mock("@/api/forms", async (importOriginal) => ({
    ...(await importOriginal()),
    callUpdateForm: vi.fn(),
}));

describe.each([
    ["Options", Options],
    ["Appearance", Appearance],
])("saving %s", (_, page) => {
    let pinia: ReturnType<typeof createPinia>;

    const save = async () => {
        // real actions, not the stubs of the global testing pinia
        const wrapper = mount(page, { global: { plugins: [pinia] } });
        await wrapper.find("form").trigger("submit");
        await flushPromises();

        return wrapper.find("button[type=submit]");
    };

    beforeEach(() => {
        vi.clearAllMocks();
        pinia = createPinia();
        setActivePinia(pinia);
        useForm().form = { uuid: "form1", name: "Survey" } as FormModel;
    });

    it("ends the spinner and shows the reason when the server refuses", async () => {
        vi.mocked(callUpdateForm).mockRejectedValue(
            new AxiosError("Unprocessable", undefined, undefined, undefined, {
                status: 422,
                data: { message: "The name field is required." },
            } as AxiosResponse),
        );

        const button = await save();

        expect(button.attributes("aria-busy")).toBe("false");
        expect(useNotice().message).toBe(
            "Your change wasn't saved: The name field is required.",
        );
    });

    it("saves without a message", async () => {
        vi.mocked(callUpdateForm).mockResolvedValue({
            data: useForm().form,
        } as AxiosResponse);

        const button = await save();

        expect(callUpdateForm).toHaveBeenCalled();
        expect(button.attributes("aria-busy")).toBe("false");
        expect(useNotice().message).toBeNull();
    });
});
