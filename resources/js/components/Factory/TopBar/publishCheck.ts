export type CheckRow = { isOk: boolean; text: string };

type Condition = FormBlockLogicCondition | EditableFormBlockBlockLogicCondition;

const plural = (count: number, word: string) =>
    `${count} ${word}${count === 1 ? "" : "s"}`;

const hasText = (block: FormBlockModel) =>
    !!block.message?.replace(/<[^>]*>|&nbsp;/g, "").trim();

// the logic editor keeps a picked source as { key, label }, an unpicked one is null
const sourceOf = (condition: Condition) =>
    typeof condition.source === "object" ? condition.source?.key : condition.source;

// Frontend only: what a respondent would trip over once the form is live.
export function publishCheck(blocks: FormBlockModel[]): CheckRow[] {
    const questions = blocks.filter((b) => b.type !== "group" && !b.is_disabled);
    const empty = questions.filter((b) => !hasText(b)).length;

    const exists = new Set(blocks.map((b) => b.uuid));
    const rules = blocks.flatMap((b) => b.logics ?? []);
    const broken = rules.filter(
        (rule) =>
            (rule.conditions as Condition[]).some((c) => {
                const source = sourceOf(c);
                return source && !exists.has(source);
            }) ||
            (rule.action === "goto" &&
                !!rule.action_payload &&
                !exists.has(rule.action_payload)),
    ).length;

    const rows: CheckRow[] = [];

    if (questions.length === 0) {
        rows.push({ isOk: false, text: "No questions yet" });
    } else if (empty > 0) {
        rows.push({
            isOk: false,
            text: `${plural(questions.length, "question")}, ${empty} without text`,
        });
    } else {
        rows.push({
            isOk: true,
            text:
                questions.length === 1
                    ? "1 question, with text"
                    : `${questions.length} questions, all with text`,
        });
    }

    if (broken > 0) {
        rows.push({
            isOk: false,
            text: `${plural(rules.length, "rule")}, ${broken} ${broken === 1 ? "points" : "point"} to a question that no longer exists`,
        });
    } else if (rules.length > 0) {
        rows.push({
            isOk: true,
            text:
                rules.length === 1
                    ? "1 rule, working"
                    : `${rules.length} rules, all working`,
        });
    }

    return rows;
}
