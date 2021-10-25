import { computed, ComputedRef } from "vue";

export default function (block: FormBlockModel | null): { activeInteractions: ComputedRef<FormBlockInteractionModel[] | undefined> } {

    const activeInteractions = computed(() => {

        let interactions;

        switch (block?.type) {
            case 'click':
            case 'multiple':
                interactions = block?.interactions?.filter((i) => {
                    return i.type === 'click';
                }) ?? [];
                break;

            case 'input':
                interactions = block?.interactions?.filter((i) => {
                    return i.type === 'input';
                }) ?? [];
                interactions = interactions.slice(0, 1);
                break;

            case 'consent':
                interactions = block?.interactions?.filter((i) => {
                    return i.type === 'consent';
                }) ?? [];

            default:
                break;
        }

        return interactions;
    });

    return {
        activeInteractions
    }
}
