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

const open = async (component: object) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const workbench = useWorkbench();
    workbench.block = { interactions: [] } as unknown as FormBlockModel;
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
        ["short text", ConfigureInput],
        ["long text", ConfigureTextarea],
        ["date", ConfigureDate],
        ["rating", ConfigureRange],
        ["file", ConfigureFile],
    ])("nothing when a %s card only opens", async (_, component) => {
        const { save } = await open(component);

        expect(save).not.toHaveBeenCalled();
    });

    it("once when a setting changes", async () => {
        const { wrapper, save } = await open(ConfigureInput);

        await wrapper.find("input").setValue("Your name");
        await flushPromises();

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].label).toBe("Your name");
    });

    it("once when a file setting changes", async () => {
        const { wrapper, save } = await open(ConfigureFile);

        await wrapper.find("input#file-max-files").setValue("3");
        await flushPromises();

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].options.allowedFiles).toBe(3);
    });
});
