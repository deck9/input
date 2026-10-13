import { describe, expect, it } from "vitest";
import { plainText, questionNumbers } from "./questionSummary";

const block = (uuid: string, type = "radio", parent_block: string | null = null) =>
    ({ uuid, type, parent_block }) as FormBlockModel;

describe("plain question text", () => {
    it("drops tags and keeps a space between paragraphs", () => {
        expect(
            plainText("<h2>Hi &amp; welcome</h2><p>How was <strong>it</strong>?</p>"),
        ).toBe("Hi & welcome How was it?");
    });

    it("is empty for no text or only an image", () => {
        expect(plainText(null)).toBe("");
        expect(plainText('<img src="https://example.com/a.png">')).toBe("");
    });
});

describe("question numbers", () => {
    it("counts on through groups and skips the group itself", () => {
        const numbers = questionNumbers([
            block("a"),
            block("g", "group"),
            block("c"),
            block("b", "radio", "g"),
            block("b2", "date", "g"),
        ]);

        expect(numbers).toEqual({ a: 1, b: 2, b2: 3, c: 4 });
    });

    it("gives an empty group nothing", () => {
        expect(questionNumbers([block("g", "group"), block("a")])).toEqual({
            a: 1,
        });
    });
});
