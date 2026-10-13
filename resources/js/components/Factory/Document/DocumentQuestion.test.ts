import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import { useWorkbench } from "@/stores";
import DocumentQuestion from "./DocumentQuestion.vue";

const question = {
    id: 7,
    uuid: "hSV2gq81LmQyTz0a",
    type: "checkbox",
    message: "<p>Which days can you help?</p>",
    is_required: true,
    is_disabled: true,
    title: "days",
    logics: [{ id: 1 }],
    interactions: [
        { type: "button", is_editable: true },
        { type: "button", is_editable: true },
        { type: "button", is_editable: false },
    ],
} as unknown as FormBlockModel;

// the closed question's own button; the gutter's + is named by aria-label
const row = "button:not([aria-label])";

const mountQuestion = (block = question) =>
    mount(DocumentQuestion, {
        props: { block, number: 3 },
        global: { stubs: { QuestionCard: { template: "<div>card</div>" } } },
    });

describe("a closed question in the document", () => {
    beforeEach(() => useWorkbench().$reset());

    it("shows its number, text and a meta line, never its random id", () => {
        const text = mountQuestion().find(row).text();

        expect(text).toContain("Question 3:");
        expect(text).toContain("Which days can you help?");
        expect(text).toContain("Checkboxes · 2 choices");
        expect(text).toContain("Required");
        expect(text).toContain("1 rule");
        expect(text).toContain("Hidden");
        expect(text).toContain("days");
        expect(text).not.toContain(question.uuid);
    });

    it("says when a question has no text yet instead of naming it by id", () => {
        const text = mountQuestion({ ...question, message: "" })
            .find(row)
            .text();

        expect(text).toContain("No question text yet");
        expect(text).not.toContain(question.uuid);
    });

    it("opens as a card when clicked", async () => {
        const workbench = useWorkbench();
        const wrapper = mountQuestion();

        await wrapper.find(row).trigger("click");
        expect(workbench.putOnWorkbench).toHaveBeenCalledWith(question);

        workbench.block = question;
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("card");
        expect(wrapper.find(row).exists()).toBe(false);
    });
});
