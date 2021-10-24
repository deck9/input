import { computed, ComputedRef } from "vue";

export default function (block: FormBlockModel | null): { activeInteractions: ComputedRef<FormBlockInteractionModel[] | undefined> } {

    const activeInteractions = computed(() => {
        let interactions = block?.interactions?.filter((i) => {
            return i.type === block.type
        }) ?? []

        if (block?.type === 'input') {
            interactions = interactions.slice(0, 1);
        }

        return interactions;
    });

    return {
        activeInteractions
    }
}
