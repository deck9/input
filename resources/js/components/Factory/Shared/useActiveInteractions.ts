import { computed, ComputedRef } from "vue";
import sortBy from "lodash/sortBy";
import { useForm } from "@/stores/form";

export default function (block: FormBlockModel | null): {
    activeInteractions: ComputedRef<FormBlockInteractionModel[] | undefined>;
    editableInteractions: ComputedRef<FormBlockInteractionModel[] | undefined>;
} {
    const activeInteractions = computed(() => {
        const store = useForm();

        if (!store.mapping || !block || !block.interactions) {
            return [];
        }

        const interactionType = store.mapping[block.type];

        const interactions = block.interactions.filter((i) => {
            return i.type === interactionType;
        });

        return sortBy(interactions, ["sequence"]);
    });

    const editableInteractions = computed(() => {
        return activeInteractions.value?.filter((interaction) => {
            return interaction.is_editable;
        });
    });

    return {
        activeInteractions,
        editableInteractions,
    };
}
