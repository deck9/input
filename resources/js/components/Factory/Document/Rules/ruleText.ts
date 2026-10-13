import sortBy from "lodash/sortBy";

// what a rule can compare a question's answer with
export type AnswerKind =
    | "choice"
    | "multi"
    | "range"
    | "number"
    | "date"
    | "text";

const kinds: Partial<Record<FormBlockType, AnswerKind>> = {
    radio: "choice",
    checkbox: "multi",
    rating: "range",
    scale: "range",
    "input-number": "number",
    date: "date",
    "input-short": "text",
    "input-long": "text",
    "input-email": "text",
    "input-link": "text",
    "input-phone": "text",
    "input-secret": "text",
};

const comparisons: Operator[] = [
    "equals",
    "equalsNot",
    "isLowerThan",
    "isGreaterThan",
];

const operatorsByKind: Record<AnswerKind, Operator[]> = {
    choice: ["equals", "equalsNot"],
    // checkbox answers are joined into one text, so "includes" is a contains
    multi: ["contains", "containsNot"],
    range: comparisons,
    number: comparisons,
    date: comparisons,
    text: [
        "equals",
        "equalsNot",
        "contains",
        "containsNot",
        "isLowerThan",
        "isGreaterThan",
    ],
};

const words: Record<Operator, string> = {
    equals: "is",
    equalsNot: "is not",
    contains: "contains",
    containsNot: "doesn't contain",
    isLowerThan: "is less than",
    isGreaterThan: "is more than",
};

const checkboxWords: Partial<Record<Operator, string>> = {
    contains: "includes",
    containsNot: "doesn't include",
};

export function answerKind(block?: FormBlockModel | null): AnswerKind | null {
    return (block && kinds[block.type]) ?? null;
}

export function operatorLabel(
    operator: Operator | undefined,
    block?: FormBlockModel | null,
): string {
    if (!operator) {
        return "is";
    }

    return (
        (answerKind(block) === "multi" && checkboxWords[operator]) ||
        words[operator]
    );
}

export function operatorsFor(block?: FormBlockModel | null) {
    const kind = answerKind(block);

    return (kind ? operatorsByKind[kind] : operatorsByKind.text).map((id) => ({
        id,
        label: operatorLabel(id, block),
    }));
}

// the answers a choice, rating or scale question can give; free fields give none
export function answerOptions(block?: FormBlockModel | null): string[] {
    const interactions = block?.interactions ?? [];
    const kind = answerKind(block);

    if (kind === "choice" || kind === "multi") {
        const labels = sortBy(interactions, "sequence")
            .filter(
                (item) =>
                    item.type === "button" && item.is_editable && item.label,
            )
            .map((item) => item.label as string);

        return [...new Set(labels)];
    }

    if (kind === "range") {
        const range = interactions.find((item) => item.type === "range");
        const start = Number(range?.options?.start ?? 1);
        const end = Number(range?.options?.end ?? 5);

        return Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) =>
            String(start + i),
        );
    }

    return [];
}
