import { describe, expect, it } from "vitest";
import { publishCheck } from "./publishCheck";

describe("publish check", () => {
    it("takes a rule whose condition has no source yet", () => {
        const blocks = [
            {
                uuid: "q1",
                type: "input-short",
                message: "<p>Your name?</p>",
                logics: [
                    { action: "show", action_payload: null, conditions: [{ source: null }] },
                ],
            },
        ] as unknown as FormBlockModel[];

        expect(publishCheck(blocks)).toEqual([
            { isOk: true, text: "1 question, with text" },
            { isOk: true, text: "1 rule, working" },
        ]);
    });

    it("counts the rules that use a deleted question", () => {
        const goto = (target: string) => ({
            action: "goto",
            action_payload: target,
            conditions: [],
        });
        const blocks = [
            {
                uuid: "q1",
                type: "input-short",
                message: "<p>Your name?</p>",
                logics: [goto("gone"), goto("q1"), goto("also-gone")],
            },
        ] as unknown as FormBlockModel[];

        expect(publishCheck(blocks)[1]).toEqual({
            isOk: false,
            text: "3 rules, 2 use deleted questions",
        });
    });
});
