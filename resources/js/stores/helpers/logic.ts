export const operators: Array<{ key: Operator; label: string }> = [
    { key: "equals", label: "is equal to" },
    { key: "equalsNot", label: "is not equal to" },
    { key: "contains", label: "contains" },
    { key: "containsNot", label: "does not contain" },
    { key: "isLowerThan", label: "is lower than" },
    { key: "isGreaterThan", label: "is greater than" },
];

// rule values are text, while rating, scale and number answers are numbers
const asText = (value: unknown): string => String(value ?? "");

// NaN for anything that isn't a number, so comparisons with it are false
const asNumber = (value: unknown): number =>
    typeof value === "number" ||
    (typeof value === "string" && value.trim() !== "")
        ? Number(value)
        : NaN;

// date answers are YYYY-MM-DD, which sorts correctly as text
const isDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

export function evaluateCondition(
    condition: FormBlockLogicCondition,
    responseValue: any,
): boolean {
    const answer = asText(responseValue);
    const value = asText(condition.value);
    const bothDates = isDate(answer) && isDate(value);

    switch (condition.operator) {
        case "equals":
            return answer === value;
        case "equalsNot":
            return answer !== value;
        case "contains":
            return answer.includes(value);
        case "containsNot":
            return !answer.includes(value);
        case "isLowerThan":
            return bothDates
                ? answer < value
                : asNumber(responseValue) < asNumber(condition.value);
        case "isGreaterThan":
            return bothDates
                ? answer > value
                : asNumber(responseValue) > asNumber(condition.value);
        default:
            return false;
    }
}

export function getResponseValue(response: any): any {
    return "payload" in response
        ? response.payload
        : response.map((p) => p.payload).join(", ");
}

export function groupConditions(
    evaluatedConditions: FormBlockLogicCondition[],
): FormBlockLogicCondition[][] {
    const groups: FormBlockLogicCondition[][] = [];
    let currentIndex = 0;

    evaluatedConditions.forEach((condition, index) => {
        if (index === 0) {
            groups[currentIndex] = [condition];
        } else {
            if (condition.chainOperator === "or") {
                currentIndex++;
            }
            if (!groups[currentIndex]) {
                groups[currentIndex] = [];
            }
            groups[currentIndex].push(condition);
        }
    });

    return groups;
}

export function evaluateConditions(
    conditions: FormBlockLogicCondition[],
    responses: FormSubmitPayload,
): FormBlockLogicCondition[] {
    return conditions.map((condition) => ({
        ...condition,
        result:
            condition.source && responses[condition.source]
                ? evaluateCondition(
                      condition,
                      getResponseValue(responses[condition.source]),
                  )
                : false,
    }));
}

export function evaluateLogicRule(
    logic: FormBlockLogic,
    responses: FormSubmitPayload,
): boolean {
    const evaluatedConditions = evaluateConditions(
        logic.conditions as FormBlockLogicCondition[],
        responses,
    );
    const conditionGroups = groupConditions(evaluatedConditions);

    const finalResult = conditionGroups.some((group) =>
        group.every((condition) => condition.result),
    );

    switch (logic.action) {
        case "show":
        case "goto":
            return finalResult;
        case "hide":
            return !finalResult;
    }
}

export function isBlockVisible(
    block: PublicFormBlockModel,
    responses: FormSubmitPayload,
): boolean {
    if (!block.logics?.length) {
        return true;
    }

    const beforeLogics = block.logics.filter(
        (logic) =>
            logic.evaluate === "before" ||
            logic.action === "show" ||
            logic.action === "hide",
    );

    // If any logic rule returns false, the block is not visible
    return beforeLogics.every((logic) => evaluateLogicRule(logic, responses));
}

export function evaluateGotoLogic(
    block: PublicFormBlockModel,
    payload: FormSubmitPayload,
): { target: string } | null {
    if (!block?.logics) return null;

    // Find goto actions that should be evaluated after block interaction
    const gotoLogics = block.logics.filter(
        (logic) => logic.action === "goto" && logic.evaluate === "after",
    );

    for (const logic of gotoLogics) {
        const shouldExecute = evaluateLogicRule(logic, payload);

        if (shouldExecute && logic.action_payload) {
            return { target: logic.action_payload };
        }
    }

    return null;
}

export function transformConditionForBackend(
    condition: EditableFormBlockBlockLogicCondition,
): FormBlockLogicCondition {
    return {
        ...condition,
        source: condition.source?.key,
        operator: condition.operator.key,
    };
}
