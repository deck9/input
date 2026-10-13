import { describe, expect, it } from "vitest";
import { shallowMount } from "@vue/test-utils";
import QuestionSettings from "./QuestionSettings.vue";

const heading = (type: string, interactionType?: FormBlockInteractionType) =>
    shallowMount(QuestionSettings, {
        props: {
            id: "settings",
            block: {
                uuid: "q1",
                type,
                interactions: [],
            } as unknown as FormBlockModel,
            interactionType,
        },
    })
        .find("h3")
        .text();

describe("the settings heading", () => {
    it.each([
        ["radio", "button", "Choices"],
        ["input-short", "input", "Answer field"],
        ["input-long", "textarea", "Answer field"],
        ["rating", "range", "Rating"],
        ["scale", "range", "Scale"],
        ["date", "date", "Date"],
        ["input-file", "file", "File upload"],
        ["consent", "consent", "Consent"],
        ["none", undefined, "Settings"],
    ] as const)(
        "names a %s question's settings %s → %s",
        (type, interaction, text) => {
            expect(heading(type, interaction)).toBe(text);
        },
    );
});
