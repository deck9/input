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
    }).find("h3");

describe("the settings heading", () => {
    it.each([
        ["radio", "button", "Choices"],
        ["input-short", "input", "Answer field"],
        ["input-long", "textarea", "Answer field"],
        ["rating", "range", "Rating"],
        ["scale", "range", "Scale"],
        ["date", "date", "Date"],
        ["input-file", "file", "File upload"],
    ] as const)(
        "names a %s question's settings %s → %s",
        (type, interaction, text) => {
            expect(heading(type, interaction).text()).toBe(text);
            expect(heading(type, interaction).classes()).not.toContain(
                "sr-only",
            );
        },
    );

    // their panel holds only Short name and Hide this question
    it.each([
        ["consent", "consent"],
        ["none", undefined],
    ] as const)("shows no heading for a %s question", (type, interaction) => {
        expect(heading(type, interaction).text()).toBe("Settings");
        expect(heading(type, interaction).classes()).toContain("sr-only");
    });
});
