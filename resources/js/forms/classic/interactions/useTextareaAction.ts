import TextareaAction from "@/forms/classic/interactions/TextareaAction.vue";

export function useTextareaAction(block: PublicFormBlockModel) {
    const useThis = ["input-long"].includes(block.type);

    const validator = (input: any) => {
        if (!input) {
            return false;
        }

        const action = block.interactions[0];

        if (action && action.options.max_chars > 0) {
            return input.payload.length <= action.options.max_chars;
        }

        return true;
    };

    return {
        useThis,
        component: TextareaAction,
        validator,
        props: {
            disableEnterKey: true,
        },
    };
}
