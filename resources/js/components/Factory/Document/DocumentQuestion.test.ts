import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
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
        global: {
            stubs: {
                QuestionCard: {
                    template: `<div tabindex="-1" class="card">card<div contenteditable="true" class="text" /></div>`,
                },
            },
        },
        attachTo: document.body,
    });

describe("a closed question in the document", () => {
    beforeEach(() => {
        // the shared test store keeps its spies' calls
        vi.clearAllMocks();
        useWorkbench().$reset();
        useForm().$reset();
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

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

    it("moves with Alt+Up/Down, closed or open", async () => {
        const store = useForm();
        const workbench = useWorkbench();
        const next = { id: 8, uuid: "next", type: "radio" } as FormBlockModel;
        store.blocks = [question, next];
        const wrapper = mountQuestion();

        await wrapper.find("button").trigger("keydown", {
            key: "ArrowDown",
            altKey: true,
        });
        expect(store.changeBlockSequence).toHaveBeenCalledWith(
            false,
            1,
            question,
        );

        workbench.block = question;
        await wrapper.vm.$nextTick();
        await wrapper.find(".card").trigger("keydown", {
            key: "ArrowUp",
            altKey: true,
        });
        // already first: nothing moves
        expect(store.changeBlockSequence).toHaveBeenCalledTimes(1);

        // a plain arrow or one with Shift is the text field's
        await wrapper.find(".card").trigger("keydown", { key: "ArrowDown" });
        await wrapper.find(".card").trigger("keydown", {
            key: "ArrowDown",
            altKey: true,
            shiftKey: true,
        });
        expect(store.changeBlockSequence).toHaveBeenCalledTimes(1);
    });

    it("closes with Escape and gives focus back to its row", async () => {
        const workbench = useWorkbench();
        vi.mocked(workbench.clearWorkbench).mockImplementation(() => {
            workbench.block = null;
        });
        workbench.block = question;
        const wrapper = mountQuestion();

        await wrapper.find(".card").trigger("keydown", { key: "Escape" });
        await flushPromises();

        expect(workbench.clearWorkbench).toHaveBeenCalled();
        expect(document.activeElement?.tagName).toBe("BUTTON");
        expect(document.activeElement?.textContent).toContain(
            "Which days can you help?",
        );
    });

    it("closes with Escape from the question text, which cancels every Escape", async () => {
        const workbench = useWorkbench();
        workbench.block = question;
        const wrapper = mountQuestion();
        const text = wrapper.find(".text");
        text.element.addEventListener("keydown", (event) =>
            event.preventDefault(),
        );

        await text.trigger("keydown", { key: "Escape" });
        await flushPromises();

        expect(workbench.clearWorkbench).toHaveBeenCalled();
    });

    it("leaves Escape to a select or menu inside the card", async () => {
        const workbench = useWorkbench();
        workbench.block = question;
        const wrapper = mountQuestion();
        const card = wrapper.find(".card");
        // like a listbox that closes on Escape
        card.element.addEventListener("keydown", (event) =>
            event.preventDefault(),
        );

        await card.trigger("keydown", { key: "Escape" });
        await flushPromises();

        expect(workbench.clearWorkbench).not.toHaveBeenCalled();
    });
});
