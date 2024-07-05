import DateAction from "@/forms/classic/interactions/DateAction.vue";
import { useI18n } from "vue-i18n";

export function useDateAction(block: PublicFormBlockModel) {
    const { t } = useI18n();
    const useThis = ["date"].includes(block.type);

    const validator = (input: any) => {
        return {
            valid: block.is_required ? input?.payload.length > 0 : true,
            message: t("validation.field_required"),
        };
    };

    return { useThis, component: DateAction, validator, props: {} };
}
