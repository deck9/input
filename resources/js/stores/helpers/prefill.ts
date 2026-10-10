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
        // an own key only: an Identifier like "constructor" must not read a built-in
        const value =
            block.title &&
            Object.prototype.hasOwnProperty.call(params, block.title)
                ? params[block.title].trim()
                : undefined;

        if (!action || !value || !prefillTypes.includes(block.type)) {
            return;
        }

        let answer: string | number = value;

        // digits with a dot, rounded to the decimal places the input shows
        if (block.type === "input-number") {
            if (!/^-?\d+(\.\d+)?$/.test(value)) {
                return;
            }

            answer = Number(
                Number(value).toFixed(action.options?.decimalPlaces ?? 0),
            );
        }

        payload[block.id] = { payload: answer, actionId: action.id };
    });

    return payload;
}
