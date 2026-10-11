import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { describe, expect, it, vi } from "vitest";
import { Component, defineComponent, h } from "vue";
import ConfigureFile from "./ConfigureFile.vue";
import ConfigureInput from "./ConfigureInput.vue";
import { useWorkbench } from "@/stores";

// like D9Input on @deck9/ui 0.17: number fields emit numbers, unclamped until blur
vi.mock("@deck9/ui", async (original) => ({
    ...(await original<typeof import("@deck9/ui")>()),
    D9Input: defineComponent({
        props: ["modelValue", "placeholder", "type"],
        emits: ["update:modelValue"],
        setup(props, { emit }) {
            return () =>
                h("input", {
                    placeholder: props.placeholder,
                    value: props.modelValue,
                    onInput: (e: Event) => {
                        const value = (e.target as HTMLInputElement).value;
                        emit(
                            "update:modelValue",
                            props.type === "number" && value !== ""
                                ? Number(value)
                                : value,
                        );
                    },
                });
        },
    }),
}));

vi.mock("../utils/useInteractionsUtils", () => ({
    useInteractionsUtils: () => ({
        findOrCreate: async () => ({ id: 7, label: "", options: {} }),
    }),
}));

// types into one field and returns the options the settings would save
const savedOptions = async (
    component: Component,
    field: string,
    typed: string,
) => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const workbench = useWorkbench();
    workbench.block = { interactions: [] } as unknown as FormBlockModel;
    const save = vi
        .spyOn(workbench, "updateInteraction")
        .mockImplementation(() => {});

    const wrapper = mount(component, {
        global: {
            plugins: [pinia],
            provide: { block: { type: "input-number" } },
        },
    });
    await flushPromises();
    await wrapper.find(`input[placeholder^="${field}"]`).setValue(typed);
    await flushPromises();

    return save.mock.lastCall?.[0].options;
};

const savedDecimalPlaces = async (typed: string) =>
    (await savedOptions(ConfigureInput, "Number of decimal places", typed))
        ?.decimalPlaces;

describe("file limits in the file block settings", () => {
    it("clamps max files to 1 to 10 before saving", async () => {
        const files = "The maximum number of allowed files";
        expect(
            (await savedOptions(ConfigureFile, files, "50"))?.allowedFiles,
        ).toBe(10);
        expect(
            (await savedOptions(ConfigureFile, files, "0"))?.allowedFiles,
        ).toBe(1);
    });

    it("clamps max size to 1 to 8 MB before saving", async () => {
        const size = "The maximum file size";
        expect(
            (await savedOptions(ConfigureFile, size, "99"))?.allowedFileSize,
        ).toBe(8);
        expect(
            (await savedOptions(ConfigureFile, size, "0"))?.allowedFileSize,
        ).toBe(1);
    });
});

describe("decimal places in the number block settings", () => {
    it("keeps a typed 0", async () => {
        expect(await savedDecimalPlaces("0")).toBe(0);
    });

    it("clamps to 0 to 10 before saving", async () => {
        expect(await savedDecimalPlaces("50")).toBe(10);
        expect(await savedDecimalPlaces("-1")).toBe(0);
    });

    it("saves nothing for an empty field", async () => {
        expect(await savedDecimalPlaces("")).toBeUndefined();
    });
});
