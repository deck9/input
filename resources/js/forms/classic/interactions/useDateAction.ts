import DateAction from "@/forms/classic/interactions/DateAction.vue";

export function useDateAction(block: PublicFormBlockModel) {
    const useThis = ["date"].includes(block.type);

    const validator = (input: any) => {
        return {
            valid: block.is_required ? input?.payload.length > 0 : true,
            message: "This field is required",
        };
    };

    return { useThis, component: DateAction, validator, props: {} };
}
