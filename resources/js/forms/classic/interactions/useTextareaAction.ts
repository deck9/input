import TextareaAction from "@/forms/classic/interactions/TextareaAction.vue";

export function useTextareaAction(block: PublicFormBlockModel) {
    const useThis = ["input-long"].includes(block.type);

    const validator = (input: any) => {
        if (
            block.is_required &&
            (!input || input?.payload?.trim().length === 0)
        ) {
            return { valid: false, message: "This field is required" };
        }

        const action = block.interactions[0];

        if (
            action &&
            action.options?.max_chars &&
            action.options?.max_chars > 0
        ) {
            if (input?.payload?.length >= action.options.max_chars) {
                return {
                    valid: false,
                    message:
                        "You have exceeded the maximum number of characters allowed.",
                };
            }
        }

        return { valid: true };
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
