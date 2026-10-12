import { ref } from "vue";
import { callGetFormBlocks } from "@/api/blocks";
import { useForm, useWorkbench } from "@/stores";

export interface DeleteCheck {
    // answers to the block, missing when the server couldn't say
    answers?: number;
    // questions that go with a group
    questions: number;
    // answers per choice id
    choices: Record<number, number>;
    // rules on other blocks that stop working
    usedBy: FormBlockRuleUse[];
}

// What a delete takes with it, asked right before: answer counts need
// includeSubmissions, and the editor's used_by can be older than its rules.
export async function checkDelete(block: FormBlockModel): Promise<DeleteCheck> {
    const store = useForm();
    let blocks = store.blocks ?? [];

    try {
        blocks = (await callGetFormBlocks(store.form!.uuid, true)).data;
    } catch {
        // ask anyway, with what the editor has
    }

    const gone = blocks.filter(
        (item) => item.uuid === block.uuid || item.parent_block === block.uuid,
    );
    const goneUuids = gone.map((item) => item.uuid);
    const fresh = gone.find((item) => item.uuid === block.uuid);

    return {
        answers: fresh?.session_count,
        questions: gone.length - 1,
        choices: Object.fromEntries(
            (fresh?.interactions ?? [])
                .filter((item) => item.responses_count !== undefined)
                .map((item) => [item.id, item.responses_count]),
        ),
        usedBy: gone
            .flatMap((item) => item.used_by ?? [])
            .filter((rule) => !goneUuids.includes(rule.block)),
    };
}

// asks before a question or group is deleted
export function useDeleteBlock(block: FormBlockModel) {
    const check = ref<DeleteCheck | null>(null);

    const ask = async () => {
        check.value = await checkDelete(block);
    };

    const cancel = () => {
        check.value = null;
    };

    const confirm = () => {
        const workbench = useWorkbench();
        check.value = null;
        useForm().deleteFormBlock(block);

        if (workbench.block?.id === block.id) {
            workbench.clearWorkbench();
        }
    };

    return { check, ask, cancel, confirm };
}
