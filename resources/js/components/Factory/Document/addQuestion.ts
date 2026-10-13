import { ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { focusBlock, useAddBlock } from "./blockFocus";

// where the type picker shows (key), and where its question goes: after a block, or last in an empty group
type AddSpot = { key: string; after: FormBlockModel | null; parent?: string };

export const addAt = ref<AddSpot | null>(null);

// the button that opened the picker gets the cursor back
let opener: HTMLElement | null = null;

// names a block in a label: "question 3", "the group Contact"
export function blockName(
    block: FormBlockModel,
    numbers: Record<string, number>,
) {
    return block.type === "group"
        ? `the group ${block.title ?? ""}`.trim()
        : `question ${numbers[block.uuid]}`;
}

export function openPicker(spot: AddSpot) {
    opener = document.activeElement as HTMLElement | null;
    addAt.value = spot;
}

export function closePicker() {
    const spot = addAt.value;
    addAt.value = null;

    if (opener?.isConnected) {
        opener.focus();
    } else if (spot) {
        focusBlock(spot.after);
    }
}

export function useAddQuestion() {
    const store = useForm();
    const workbench = useWorkbench();
    const { addBlock } = useAddBlock();

    const addQuestion = async (type: FormBlockType) => {
        const spot = addAt.value;
        const before = workbench.block;
        addAt.value = null;

        // the store places it by object, and a save may have swapped that object
        const after =
            store.blocks?.find((block) => block.uuid === spot?.after?.uuid) ??
            null;
        await addBlock(after, type, spot?.parent ?? null);

        // a failed create opens nothing
        if (spot && workbench.block === before && opener?.isConnected) {
            opener.focus();
        }
    };

    return { addQuestion };
}
