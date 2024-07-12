import RangeAction from "@/forms/classic/interactions/RangeAction.vue";
import { useI18n } from "vue-i18n";
export function useRangeAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = ["rating", "scale"].includes(block.type);

    const validator = (input: any) => {
        const validationMessage = t("validation.rating_required");

        if (block.is_required) {
            if (!input) {
                return {
                    message: validationMessage,
                    valid: false,
                };
            }

            return {
                valid: input?.payload && input.actionId,
                message: validationMessage,
            };
        }

        return {
            valid: true,
        };
    };

    return { useThis, component: RangeAction, validator, props: {} };
}
