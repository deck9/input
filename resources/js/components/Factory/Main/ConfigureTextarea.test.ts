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
        findOrCreate: async () => ({
            id: 7,
            label: "",
            options: saved.options,
        }),
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
            (
                wrapper.find("input#textarea-max-chars")
                    .element as HTMLInputElement
            ).value,
        ).toBe("");
        expect(save).not.toHaveBeenCalled();
    });

    it("shows the saved limit when a question with a limit reopens", async () => {
        const { wrapper } = await reopen({ rows: 5, max_chars: 120 });

        expect(
            (
                wrapper.find("input#textarea-max-chars")
                    .element as HTMLInputElement
            ).value,
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

describe("long text max characters, bad values", () => {
    const maxInput = (wrapper: Awaited<ReturnType<typeof reopen>>["wrapper"]) =>
        wrapper.find("input#textarea-max-chars");

    it.each(["0", "-5", "2.5"])(
        "never saves %s and says why",
        async (value) => {
            const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

            await maxInput(wrapper).setValue(value);
            await flushPromises();

            expect(save).not.toHaveBeenCalled();
            expect(wrapper.find("#textarea-max-chars-error").exists()).toBe(
                true,
            );
        },
    );

    it.each([0, -3])("shows a saved %s as empty", async (saved) => {
        const { wrapper } = await reopen({ rows: 5, max_chars: saved });

        expect((maxInput(wrapper).element as HTMLInputElement).value).toBe("");
    });
});

describe("long text height", () => {
    const rowsInput = (
        wrapper: Awaited<ReturnType<typeof reopen>>["wrapper"],
    ) => wrapper.find("input#textarea-rows");

    it("saves no height when the owner clears it, and keeps it empty on reopen", async () => {
        const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

        await rowsInput(wrapper).setValue("");
        await flushPromises();

        expect(save.mock.lastCall?.[0].options.rows).toBeNull();

        const reopened = await reopen({ rows: null, max_chars: 500 });
        expect(
            (rowsInput(reopened.wrapper).element as HTMLInputElement).value,
        ).toBe("");
        expect(reopened.save).not.toHaveBeenCalled();
    });

    it.each(["0", "-1", "2.5", "11"])("never saves a height of %s", async (value) => {
        const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

        await rowsInput(wrapper).setValue(value);
        await flushPromises();

        expect(save).not.toHaveBeenCalled();
        expect(wrapper.find("#textarea-rows-error").exists()).toBe(true);
    });
});
