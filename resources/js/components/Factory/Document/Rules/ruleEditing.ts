import { ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { answerKind, operatorsFor } from "./ruleText";

// the one rule that shows as pickers: its block and its place in the block's rules
export const editing = ref<{ block: string; index: number } | null>(null);

// where the cursor goes back to when a new rule is dropped
let opener: HTMLElement | null = null;

// ends editing; a new rule that was never saved goes with it
export function stopEditing() {
    const current = editing.value;
    editing.value = null;

    const block = useForm().blocks?.find(
        (item) => item.uuid === current?.block,
    );
    const rule = current && block?.logics?.[current.index];

    if (rule && rule.id === undefined) {
        block.logics?.splice(current.index, 1);
    }
}

function start(block: FormBlockModel, index: number) {
    const workbench = useWorkbench();

    opener = document.activeElement as HTMLElement | null;
    editing.value = { block: block.uuid, index };

    if (workbench.block?.id !== block.id) {
        workbench.putOnWorkbench(block);
    }
}

export function editRule(block: FormBlockModel, index: number) {
    stopEditing();
    start(block, index);
}

// a question jumps on its own answer; a group hides
export function addRule(block: FormBlockModel) {
    stopEditing();

    const isGroup = block.type === "group";
    const source = !isGroup && answerKind(block) ? block : null;
    const logics = block.logics ?? [];

    block.logics = [
        ...logics,
        {
            form_block_id: block.id,
            name: `Rule #${logics.length + 1}`,
            action: isGroup ? "hide" : "goto",
            action_payload: null,
            evaluate: isGroup ? "before" : "after",
            conditions: [
                {
                    source: source?.uuid,
                    operator: operatorsFor(source)[0].id,
                    value: "",
                    chainOperator: "and",
                },
            ],
        },
    ];

    start(block, logics.length);
}

// the saved rule takes the place of the one being edited
export function keepSaved(rule: FormBlockLogic) {
    const current = editing.value;
    const block = useForm().blocks?.find(
        (item) => item.uuid === current?.block,
    );

    if (current && block?.logics) {
        block.logics[current.index] = rule;
    }

    editing.value = null;
}

export function returnFocus(fallback: HTMLElement | null) {
    (fallback ?? (opener?.isConnected ? opener : null))?.focus();
}
