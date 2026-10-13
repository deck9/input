import { nextTick, ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { questionNumbers } from "./questionSummary";
import { cursorFor } from "./blockFocus";

// what the document's live region says after a move
export const moveNote = ref("");

type Step = -1 | 1;

// where one step takes a block: a question steps into a group next to it and
// out at its ends, a group steps over a whole block
function stepTarget(
    blocks: FormBlockModel[],
    block: FormBlockModel,
    step: Step,
): { scope: string | null; index: number } | null {
    const inScope = (parent: string | null) =>
        blocks.filter((item) => (item.parent_block ?? null) === parent);
    const parent = block.parent_block ?? null;
    const siblings = inScope(parent);
    const index = siblings.findIndex((item) => item.id === block.id) + step;
    const next = siblings[index];

    if (block.type !== "group") {
        if (parent && !next) {
            const group = inScope(null).findIndex(
                (item) => item.uuid === parent,
            );

            return { scope: null, index: group + (step > 0 ? 1 : 0) };
        }

        if (!parent && next?.type === "group") {
            return {
                scope: next.uuid,
                index: step > 0 ? 0 : inScope(next.uuid).length,
            };
        }
    }

    return next ? { scope: parent, index } : null;
}

export function useMoveBlock() {
    const store = useForm();
    const workbench = useWorkbench();

    const canMove = (block: FormBlockModel, step: Step) =>
        stepTarget(store.blocks ?? [], block, step) !== null;

    const say = async (text: string) => {
        // a repeated text is only read out again after a change
        moveNote.value = "";
        await nextTick();
        moveNote.value = text;
    };

    const moveBlock = async (block: FormBlockModel, step: Step) => {
        const target = stepTarget(store.blocks ?? [], block, step);

        if (!target) {
            await say(step < 0 ? "Already at the top" : "Already at the bottom");
            return false;
        }

        const from = block.parent_block ?? null;
        const focused = document.activeElement as HTMLElement | null;

        store.changeBlockSequence(target.scope ?? false, target.index, block);
        await nextTick();

        // a moved element loses focus; one in another list is a new element
        if (focused?.isConnected) {
            focused.focus();
        } else if (workbench.block?.id === block.id) {
            cursorFor.value = block.uuid;
        } else {
            document
                .getElementById(`row-${block.uuid}`)
                ?.querySelector<HTMLElement>(":scope > button")
                ?.focus();
        }

        const blocks = store.blocks ?? [];
        const numbers = questionNumbers(blocks);
        const top = blocks.filter((item) => !item.parent_block);
        const groupName = (uuid: string | null) =>
            blocks.find((item) => item.uuid === uuid)?.title || "Group";

        if (block.type === "group") {
            await say(
                `Moved group ${groupName(block.uuid)} to position ${top.findIndex((item) => item.id === block.id) + 1} of ${top.length}`,
            );
            return true;
        }

        const to = `to position ${numbers[block.uuid]} of ${Object.keys(numbers).length}`;

        if (target.scope === from) {
            await say(`Moved ${to}`);
        } else if (target.scope) {
            await say(`Moved into group ${groupName(target.scope)}, ${to}`);
        } else {
            await say(`Moved out of group ${groupName(from)}, ${to}`);
        }

        return true;
    };

    // Alt+Up/Down moves a block
    const onMoveKey = (event: KeyboardEvent, block: FormBlockModel) => {
        const step = { ArrowUp: -1, ArrowDown: 1 }[event.key] as Step;

        if (
            !step ||
            !event.altKey ||
            event.shiftKey ||
            event.ctrlKey ||
            event.metaKey
        ) {
            return;
        }

        event.preventDefault();
        moveBlock(block, step);
    };

    return { canMove, moveBlock, onMoveKey };
}
