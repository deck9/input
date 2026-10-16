import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import ConfigureDate from "./ConfigureDate.vue";
import ConfigureFile from "./ConfigureFile.vue";
import ConfigureInput from "./ConfigureInput.vue";
import ConfigureRange from "./ConfigureRange.vue";
import ConfigureTextarea from "./ConfigureTextarea.vue";
import { useWorkbench } from "@/stores";

// the server sends empty options as []
vi.mock("../utils/useInteractionsUtils", () => ({
    useInteractionsUtils: () => ({
        findOrCreate: async () => ({ id: 7, label: "", options: [] }),
    }),
}));
vi.mock("@/components/Factory/utils/useInteractionsUtils", () => ({
    useInteractionsUtils: () => ({
        findOrCreate: async () => ({ id: 7, label: "", options: [] }),
    }),
}));

// an answer that exists already, or none yet: the card creates it
const open = async (component: object, type?: string) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const workbench = useWorkbench();
    workbench.block = {
        interactions: type ? [{ type }] : [],
    } as unknown as FormBlockModel;
    const save = vi
        .spyOn(workbench, "updateInteraction")
        .mockImplementation(() => {});

    const wrapper = mount(component, {
        global: { plugins: [pinia], provide: { block: { type: "input" } } },
    });
    await flushPromises();

    return { wrapper, save };
};

describe("answer settings save", () => {
    it.each([
        ["short text", ConfigureInput, "input"],
        ["long text", ConfigureTextarea, "textarea"],
        ["date", ConfigureDate, "date"],
        ["rating", ConfigureRange, "range"],
        ["file", ConfigureFile, "file"],
    ])("nothing when a %s card only opens", async (_, component, type) => {
        const { save } = await open(component, type);

        expect(save).not.toHaveBeenCalled();
    });

    it("once when a setting changes", async () => {
        const { wrapper, save } = await open(ConfigureInput, "input");

        await wrapper.find("input").setValue("Your name");
        await flushPromises();

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].label).toBe("Your name");
    });

    it("once when a file setting changes", async () => {
        const { wrapper, save } = await open(ConfigureFile, "file");

        await wrapper.find("input#file-max-files").setValue("3");
        await flushPromises();

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].options.allowedFiles).toBe(3);
    });

    it("once with the defaults when the card creates a file answer", async () => {
        const { save } = await open(ConfigureFile);

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].options).toMatchObject({
            allowedFiles: 1,
            allowedFileSize: 4,
        });
    });

    it("once with the defaults when the card creates a long text answer", async () => {
        const { save } = await open(ConfigureTextarea);

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].options).toEqual({
            rows: 5,
            max_chars: 500,
        });
    });
});
