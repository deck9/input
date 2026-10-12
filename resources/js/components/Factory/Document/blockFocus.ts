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

// brings a question or group to the top of the document
export async function scrollToBlock(uuid: string) {
    await nextTick();
    document.getElementById(`row-${uuid}`)?.scrollIntoView({ block: "start" });
}

// a new block opens with the cursor in it
export function useAddBlock() {
    const store = useForm();
    const workbench = useWorkbench();

    const addBlock = async (
        ...args: Parameters<typeof store.createFormBlock>
    ) => {
        await store.createFormBlock(...args);
        await focusBlock(workbench.block);
    };

    return { addBlock };
}
