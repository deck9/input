// question types a URL param can fill in
const prefillTypes: FormBlockType[] = [
    "input-short",
    "input-long",
    "input-email",
    "input-number",
    "input-link",
    "input-phone",
];

// answers from URL params, matched by the question's Identifier (its title)
export function prefillPayload(
    blocks: PublicFormBlockModel[],
    params: Record<string, string>,
): FormSubmitPayload {
    const payload: FormSubmitPayload = {};

    blocks.forEach((block) => {
        const action = block.interactions[0];
        const value = block.title ? params[block.title]?.trim() : undefined;

        if (!action || !value || !prefillTypes.includes(block.type)) {
            return;
        }

        // a number question stores a number, like a typed answer
        const answer = block.type === "input-number" ? Number(value) : value;

        if (Number.isNaN(answer)) {
            return;
        }

        payload[block.id] = { payload: answer, actionId: action.id };
    });

    return payload;
}
