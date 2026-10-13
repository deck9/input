import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import RuleGutter from "./RuleGutter.vue";

const block = (uuid: string, logics: Partial<FormBlockLogic>[] = []) =>
    ({ uuid, type: "radio", logics }) as unknown as FormBlockModel;

const row = (uuid: string, top: number) => {
    const element = document.createElement("div");
    element.id = `row-${uuid}`;
    element.getBoundingClientRect = () => ({ top }) as DOMRect;
    document.body.append(element);
};

const lines = () => document.querySelectorAll("[data-rule-line]");

describe("the gutter line of the open question", () => {
    beforeEach(() => {
        row("q-1", 100);
        row("q-2", 200);
        row("q-3", 300);
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    const open = (source: FormBlockModel) => {
        useForm().blocks = [source, block("q-2"), block("q-3")];
        useWorkbench().block = source;
        return mount(RuleGutter, { attachTo: document.body });
    };

    it("runs from the question down to where its rule jumps", async () => {
        open(block("q-1", [{ action: "goto", action_payload: "q-3" }]));

        await vi.waitFor(() => expect(lines()).toHaveLength(1));
        const line = lines()[0] as HTMLElement;

        expect(line.style.top).toBe("124px");
        expect(line.style.height).toBe("200px");
    });

    it("draws nothing for hide rules, deleted targets or jumps back up", async () => {
        const wrapper = open(
            block("q-2", [
                { action: "hide", action_payload: "q-3" },
                { action: "goto", action_payload: "gone" },
                { action: "goto", action_payload: "q-1" },
            ]),
        );
        await wrapper.vm.$nextTick();
        await wrapper.vm.$nextTick();

        expect(lines()).toHaveLength(0);
    });
});
