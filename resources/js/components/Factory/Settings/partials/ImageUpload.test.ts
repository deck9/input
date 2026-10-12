import { flushPromises, mount } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ImageUpload from "./ImageUpload.vue";
import { callUploadFormImage } from "@/api/forms";
import { useForm } from "@/stores";

vi.mock("@/api/forms", async (importOriginal) => ({
    ...(await importOriginal()),
    callUploadFormImage: vi.fn(),
}));

// the file dialog: picking a file calls back like the browser would
let pick: (files: File[]) => Promise<void>;
vi.mock("@vueuse/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useFileDialog: () => ({
        open: vi.fn(),
        onChange: (callback: typeof pick) => (pick = callback),
    }),
}));

describe("image upload", () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        vi.clearAllMocks();
        // real actions, not the stubs of the global testing pinia
        pinia = createPinia();
        setActivePinia(pinia);
        useForm().form = { uuid: "form1", name: "Survey" } as FormModel;
    });

    it("shows no old error after a good upload", async () => {
        const wrapper = mount(ImageUpload, {
            props: { label: "Brand logo", type: "avatar" as ImageType },
            global: { plugins: [pinia] },
        });
        const file = new File(["x"], "logo.png", { type: "image/png" });

        vi.mocked(callUploadFormImage).mockRejectedValueOnce(
            new AxiosError("Unprocessable", undefined, undefined, undefined, {
                status: 422,
                data: { message: "The image may not be greater than 4096 kilobytes." },
            } as AxiosResponse),
        );
        await pick([file]);
        await flushPromises();
        expect(wrapper.text()).toContain("The image may not be greater than 4096 kilobytes.");

        vi.mocked(callUploadFormImage).mockResolvedValueOnce({
            data: { avatar: "/images/logo.png" },
        } as AxiosResponse);
        await pick([file]);
        await flushPromises();

        expect(wrapper.text()).not.toContain("4096 kilobytes");
        expect(wrapper.find("img").attributes("src")).toContain("/images/logo.png");
    });
});
