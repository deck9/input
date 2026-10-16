import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import ConfigureTextarea from "./ConfigureTextarea.vue";
import { useWorkbench } from "@/stores";

const saved = vi.hoisted(() => ({
    options: {} as Record<string, unknown>,
}));

vi.mock("../utils/useInteractionsUtils", () => ({
    useInteractionsUtils: () => ({
        findOrCreate: async () => ({ id: 7, label: "", options: saved.options }),
    }),
}));

// a long text answer that was saved before, with the given options
const reopen = async (options: Record<string, unknown>) => {
    saved.options = options;
    const pinia = createPinia();
    setActivePinia(pinia);
    const workbench = useWorkbench();
    workbench.block = {
        interactions: [{ type: "textarea" }],
    } as unknown as FormBlockModel;
    const save = vi
        .spyOn(workbench, "updateInteraction")
        .mockImplementation(() => {});

    const wrapper = mount(ConfigureTextarea, {
        global: { plugins: [pinia], provide: { block: { type: "input" } } },
    });
    await flushPromises();

    return { wrapper, save };
};

describe("long text max characters", () => {
    it("stays empty and saves nothing when a question with no limit reopens", async () => {
        const { wrapper, save } = await reopen({ rows: 5, max_chars: null });

        expect(
            (wrapper.find("input#textarea-max-chars").element as HTMLInputElement)
                .value,
        ).toBe("");
        expect(save).not.toHaveBeenCalled();
    });

    it("shows the saved limit when a question with a limit reopens", async () => {
        const { wrapper } = await reopen({ rows: 5, max_chars: 120 });

        expect(
            (wrapper.find("input#textarea-max-chars").element as HTMLInputElement)
                .value,
        ).toBe("120");
    });

    it("saves no limit when the owner empties the field", async () => {
        const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

        await wrapper.find("input#textarea-max-chars").setValue("");
        await flushPromises();

        expect(save).toHaveBeenCalledTimes(1);
        expect(save.mock.lastCall?.[0].options.max_chars).toBeNull();
    });
});
