import { flushPromises, mount } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "vue";
import { PiniaDebounce } from "@pinia/plugin-debounce";
import debounce from "lodash/debounce";
import ConfigureTextarea from "./ConfigureTextarea.vue";
import { useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import { callUpdateFormBlockInteraction } from "@/api/interactions";

const saved = vi.hoisted(() => ({
    options: {} as Record<string, unknown>,
}));

vi.mock("@/api/interactions", () => ({
    callUpdateFormBlockInteraction: vi.fn(),
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

    it.each(["0", "-1", "2.5", "11"])(
        "never saves a height of %s",
        async (value) => {
            const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

            await rowsInput(wrapper).setValue(value);
            await flushPromises();

            expect(save).not.toHaveBeenCalled();
            expect(wrapper.find("#textarea-rows-error").exists()).toBe(true);
        },
    );
});

describe("half-typed numbers", () => {
    // the browser reads a half-typed "-" or "2." as an empty value and flags it
    const typeHalf = async (selector: string, wrapper: any) => {
        const input = wrapper.find(selector);
        Object.defineProperty(input.element, "validity", {
            value: { badInput: true },
            configurable: true,
        });
        await input.setValue("");
        await flushPromises();
    };

    it.each([
        [
            "max characters",
            "input#textarea-max-chars",
            "#textarea-max-chars-error",
        ],
        ["height", "input#textarea-rows", "#textarea-rows-error"],
    ])(
        "does not save %s as empty while it holds a bad number",
        async (_, input, error) => {
            const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });

            await typeHalf(input, wrapper);

            expect(save).not.toHaveBeenCalled();
            expect(wrapper.find(error).exists()).toBe(true);
        },
    );

    it("saves no limit once the owner deletes the half-typed sign", async () => {
        const { wrapper, save } = await reopen({ rows: 5, max_chars: 500 });
        await typeHalf("input#textarea-max-chars", wrapper);

        const input = wrapper.find("input#textarea-max-chars");
        Object.defineProperty(input.element, "validity", {
            value: { badInput: false },
            configurable: true,
        });
        await input.setValue("");
        await flushPromises();

        expect(save.mock.lastCall?.[0].options.max_chars).toBeNull();
    });
});

describe("typed key by key", () => {
    afterEach(() => vi.useRealTimers());

    // an answer saved with height 5 and limit 500, saving like in the editor
    const open = async () => {
        saved.options = { rows: 5, max_chars: 500 };
        // the debounce the app uses (plugins run only once pinia is in an app)
        const pinia = createPinia();
        pinia.use(PiniaDebounce(debounce));
        createApp({}).use(pinia);
        setActivePinia(pinia);
        useWorkbench().block = {
            id: 3,
            interactions: [
                {
                    id: 7,
                    type: "textarea",
                    form_block_id: 3,
                    label: "",
                    options: { ...saved.options },
                },
            ],
        } as unknown as FormBlockModel;
        vi.mocked(callUpdateFormBlockInteraction).mockReset();
        vi.mocked(callUpdateFormBlockInteraction).mockResolvedValue(
            {} as AxiosResponse,
        );

        const wrapper = mount(ConfigureTextarea, {
            global: { plugins: [pinia], provide: { block: { type: "input" } } },
        });
        await flushPromises();
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });

        // one key: the field's value and whether the browser flags it as half typed
        const press = async (selector: string, value: string, half = false) => {
            const input = wrapper.find(selector);
            Object.defineProperty(input.element, "validity", {
                value: { badInput: half },
                configurable: true,
            });
            await input.setValue(value);
            await flushPromises();
        };
        // the options of each save that reached the server
        const sent = async () => {
            vi.advanceTimersByTime(1000);
            await flushPromises();

            return vi
                .mocked(callUpdateFormBlockInteraction)
                .mock.calls.map(([interaction]) => interaction.options);
        };

        return { wrapper, press, sent };
    };

    it("keeps 500 when the owner types 2.5, not the 2 on the way", async () => {
        const { wrapper, press, sent } = await open();

        await press("input#textarea-max-chars", "2");
        await press("input#textarea-max-chars", "", true);
        await press("input#textarea-max-chars", "2.5");

        expect(await sent()).toEqual([{ rows: 5, max_chars: 500 }]);
        expect(wrapper.find("#textarea-max-chars-error").exists()).toBe(true);
    });

    it("keeps height 5 when the owner types 11, not the 1 on the way", async () => {
        const { wrapper, press, sent } = await open();

        await press("input#textarea-rows", "1");
        await press("input#textarea-rows", "11");

        expect(await sent()).toEqual([{ rows: 5, max_chars: 500 }]);
        expect(wrapper.find("#textarea-rows-error").exists()).toBe(true);
    });

    it("saves height 10 without the 1 on the way", async () => {
        const { press, sent } = await open();

        await press("input#textarea-rows", "1");
        await press("input#textarea-rows", "10");

        expect(await sent()).toEqual([{ rows: 10, max_chars: 500 }]);
    });

    it("still saves the height changed just before a wrong limit", async () => {
        const { press, sent } = await open();

        await press("input#textarea-rows", "7");
        await press("input#textarea-max-chars", "2");
        await press("input#textarea-max-chars", "-2");

        expect(await sent()).toEqual([{ rows: 7, max_chars: 500 }]);
    });

    it("saves 800 over 500 and ends saved", async () => {
        const { press, sent } = await open();

        await press("input#textarea-max-chars", "8");
        await press("input#textarea-max-chars", "80");
        await press("input#textarea-max-chars", "800");
        expect(useNotice().saveStatus).toBe("saving");

        expect(await sent()).toEqual([{ rows: 5, max_chars: 800 }]);
        expect(useNotice().saveStatus).toBe("idle");
    });
});
