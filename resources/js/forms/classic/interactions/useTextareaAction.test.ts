import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import CharCount from "@/components/CharCount.vue";
import { useTextareaAction } from "./useTextareaAction";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

const limitOf = (max: number) =>
    useTextareaAction({
        type: "input-long",
        is_required: false,
        interactions: [{ options: { max_chars: max } }],
    } as unknown as PublicFormBlockModel).validator;

describe("long text limit edge", () => {
    it("accepts exactly N characters and refuses N + 1", () => {
        const validate = limitOf(5);

        expect(validate({ payload: "a".repeat(5) }).valid).toBe(true);
        expect(validate({ payload: "a".repeat(6) }).valid).toBe(false);
    });

    it("shows the counter in the warning color only above N", () => {
        const counter = (text: string) =>
            mount(CharCount, { props: { text, maxChars: 5 } }).find("span");

        expect(counter("a".repeat(5)).classes()).not.toContain("text-red-600");
        expect(counter("a".repeat(6)).classes()).toContain("text-red-600");
    });
});
