import { nextTick, ref } from "vue";
import { useForm, useWorkbench } from "@/stores";

// the question whose card takes the cursor once it shows: its text editor isn't there at once
export const cursorFor = ref<string | null>(null);

// puts the cursor in a question's text, or in a group's name
export async function focusBlock(block: FormBlockModel | null): Promise<boolean> {
    if (!block) {
        return false;
    }

    if (block.type !== "group") {
        cursorFor.value = block.uuid;
        return true;
    }

    await nextTick();
    const name = document.getElementById(`group-${block.uuid}-name`);
    name?.focus();

    return name !== null;
}

// brings a question or group into view, by default to the top of the document
export async function scrollToBlock(
    uuid: string,
    block: ScrollLogicalPosition = "start",
) {
    await nextTick();
    document.getElementById(`row-${uuid}`)?.scrollIntoView({ block });
}

// a new block or a copy opens with the cursor in it
export function useAddBlock() {
    const store = useForm();
    const workbench = useWorkbench();

    const opens = async (create: () => Promise<void>) => {
        const before = workbench.block;
        await create();

        // a failed create keeps the open block: leave the cursor where it is
        if (workbench.block !== before) {
            await focusBlock(workbench.block);
        }
    };

    const addBlock = (...args: Parameters<typeof store.createFormBlock>) =>
        opens(() => store.createFormBlock(...args));

    const duplicateBlock = (block: FormBlockModel) =>
        opens(() => store.duplicateFormBlock(block));

    return { addBlock, duplicateBlock };
}
