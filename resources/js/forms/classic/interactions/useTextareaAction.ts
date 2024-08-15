import TextareaAction from "@/forms/classic/interactions/TextareaAction.vue";
import { useI18n } from "vue-i18n";

export function useTextareaAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = ["input-long"].includes(block.type);

    const validator = (input: any) => {
        if (
            block.is_required &&
            (!input || input?.payload?.trim().length === 0)
        ) {
            return { valid: false, message: t("validation.field_required") };
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
                        t("validation.max_characters"),
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
            enableInputMode: true,
        },
    };
}
