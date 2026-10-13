import { describe, expect, it } from "vitest";
import { answerOptions, operatorLabel, operatorsFor } from "./ruleText";

const block = (type: string, interactions: unknown[] = []) =>
    ({ uuid: type, type, interactions }) as unknown as FormBlockModel;

const labels = (type: string) => operatorsFor(block(type)).map((o) => o.label);

describe("rule operators", () => {
    it("offer is and is not for a single choice", () => {
        expect(labels("radio")).toEqual(["is", "is not"]);
    });

    it("offer includes and doesn't include for checkboxes", () => {
        expect(labels("checkbox")).toEqual(["includes", "doesn't include"]);
    });

    it.each(["input-number", "rating", "scale", "date"])(
        "offer comparisons for %s",
        (type) => {
            expect(labels(type)).toEqual([
                "is",
                "is not",
                "is less than",
                "is more than",
            ]);
        },
    );

    it("offer all six for text", () => {
        expect(labels("input-short")).toEqual([
            "is",
            "is not",
            "contains",
            "doesn't contain",
            "is less than",
            "is more than",
        ]);
    });

    it("name a stored operator in words", () => {
        expect(operatorLabel("equals", block("radio"))).toBe("is");
        expect(operatorLabel("contains", block("checkbox"))).toBe("includes");
        expect(operatorLabel("isGreaterThan", undefined)).toBe("is more than");
    });
});

describe("rule answers", () => {
    it("are the choices of a choice question, in order", () => {
        const question = block("radio", [
            { type: "button", is_editable: true, label: "No", sequence: 2 },
            { type: "button", is_editable: true, label: "Yes", sequence: 1 },
            { type: "button", is_editable: false, label: "Other", sequence: 3 },
            { type: "button", is_editable: true, label: "", sequence: 4 },
        ]);

        expect(answerOptions(question)).toEqual(["Yes", "No"]);
    });

    it("are the range of a rating or scale", () => {
        const scale = block("scale", [
            { type: "range", options: { start: 0, end: 3 } },
        ]);

        expect(answerOptions(scale)).toEqual(["0", "1", "2", "3"]);
        expect(answerOptions(block("rating"))).toEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
        ]);
    });

    it("are free for text, number and date", () => {
        expect(answerOptions(block("input-short"))).toEqual([]);
        expect(answerOptions(block("date"))).toEqual([]);
    });
});
