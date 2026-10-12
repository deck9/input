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

// a new block opens with the cursor in it
export function useAddBlock() {
    const store = useForm();
    const workbench = useWorkbench();

    const addBlock = async (
        ...args: Parameters<typeof store.createFormBlock>
    ) => {
        const before = workbench.block;
        await store.createFormBlock(...args);

        // a failed create keeps the open block: leave the cursor where it is
        if (workbench.block !== before) {
            await focusBlock(workbench.block);
        }
    };

    return { addBlock };
}
