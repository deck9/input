import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useForm } from "@/stores";
import FormDocument from "./FormDocument.vue";

const mountDocument = () =>
    mount(FormDocument, {
        props: { status: "loaded" },
        global: {
            stubs: {
                DocumentList: { template: "<div>questions</div>" },
                EmptyState: { template: "<div>no questions</div>" },
                EndScreenBlock: { template: "<div>end screen</div>" },
                BlockLogicEditor: true,
            },
        },
    });

describe("the form document", () => {
    it.each([
        ["questions", [{ uuid: "q1", type: "input-short" }]],
        ["no questions", []],
    ])("shows the end screen after %s", (first, blocks) => {
        useForm().blocks = blocks as FormBlockModel[];
        const text = mountDocument().text();

        expect(text.indexOf(first)).toBeGreaterThan(-1);
        expect(text.indexOf("end screen")).toBeGreaterThan(text.indexOf(first));
    });
});
