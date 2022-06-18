import TextareaAction from "@/forms/classic/interactions/TextareaAction.vue";

export function useTextareaAction(block: PublicFormBlockModel) {
    const useThis = ["input-long"].includes(block.type);

    const validator = (input: any) => {
        if (!input) {
            return false;
        }

        return true;
    };

    return { useThis, component: TextareaAction, validator };
}
