// the text a closed question shows: no HTML, one space where a paragraph ended
export function plainText(html: string | null): string {
    if (!html) {
        return "";
    }

    const spaced = html.replace(/<\/(p|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, "$& ");
    const doc = new DOMParser().parseFromString(spaced, "text/html");

    return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}

// questions count on through groups; a group itself gets no number
export function questionNumbers(
    blocks: FormBlockModel[],
): Record<string, number> {
    const numbers: Record<string, number> = {};
    const inScope = (parent: string | null) =>
        blocks.filter((block) => (block.parent_block ?? null) === parent);
    let next = 1;

    for (const block of inScope(null)) {
        const questions =
            block.type === "group" ? inScope(block.uuid) : [block];

        for (const question of questions) {
            numbers[question.uuid] = next++;
        }
    }

    return numbers;
}
