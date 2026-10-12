import { nextTick } from "vue";
import { useForm, useWorkbench } from "@/stores";

// a new block opens with the cursor in its text, or in its name for a group
export function useAddBlock() {
    const store = useForm();
    const workbench = useWorkbench();

    const addBlock = async (
        ...args: Parameters<typeof store.createFormBlock>
    ) => {
        await store.createFormBlock(...args);
        await nextTick();

        const block = workbench.block;
        const field =
            block?.type === "group"
                ? `group-${block.uuid}-name`
                : `question-${block?.uuid}-text`;

        document.getElementById(field)?.focus();
    };

    return { addBlock };
}
