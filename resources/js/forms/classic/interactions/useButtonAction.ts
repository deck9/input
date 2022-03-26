import ButtonAction from "@/forms/classic/interactions/ButtonAction.vue";

export function useButtonAction(block: PublicFormBlockModel) {
    const useThis = ["radio", "checkbox"].includes(block.type);

    return { useThis, component: ButtonAction };
}
