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

const mountQuestion = (block = question) =>
    mount(DocumentQuestion, {
        props: { block, number: 3 },
        global: { stubs: { QuestionCard: { template: "<div>card</div>" } } },
    });

describe("a closed question in the document", () => {
    beforeEach(() => useWorkbench().$reset());

    it("shows its number, text and a meta line, never its random id", () => {
        const text = mountQuestion().find("button").text();

        expect(text).toContain("Question 3:");
        expect(text).toContain("Which days can you help?");
        expect(text).toContain("Checkboxes · 2 choices");
        expect(text).toContain("Required");
        // its rules show as sentences under it
        expect(text).not.toContain("rule");
        expect(text).toContain("Always hidden");
        expect(text).toContain("days");
        expect(text).not.toContain(question.uuid);
    });

    it("says when a question has no text yet instead of naming it by id", () => {
        const text = mountQuestion({ ...question, message: "" })
            .find("button")
            .text();

        expect(text).toContain("No question text yet");
        expect(text).not.toContain(question.uuid);
    });

    it("opens as a card when clicked", async () => {
        const workbench = useWorkbench();
        const wrapper = mountQuestion();

        await wrapper.find("button").trigger("click");
        expect(workbench.putOnWorkbench).toHaveBeenCalledWith(question);

        workbench.block = question;
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("card");
        expect(wrapper.find("button").exists()).toBe(false);
    });
});
