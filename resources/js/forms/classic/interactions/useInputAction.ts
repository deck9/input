import InputAction from "@/forms/classic/interactions/InputAction.vue";
import { string, number } from "yup";

export function useInputAction(block: PublicFormBlockModel) {
    const useThis = [
        "input-short",
        "input-email",
        "input-number",
        "input-link",
        "input-phone",
    ].includes(block.type);

    const validator = (input: any) => {
        const emailValidator = string().required().email();
        const linkValidator = string().required().url();
        const numberValidator = number().required();
        const phoneValidator = string()
            .required()
            .min(7)
            .matches(/^[+]?(?:[0-9]+[\s-]?[0-9]+)+$/);

        switch (block.type) {
            case "input-email":
                return emailValidator.isValidSync(input?.payload);
            case "input-number":
                return numberValidator.isValidSync(input?.payload);
            case "input-link":
                return linkValidator.isValidSync(input?.payload);
            case "input-phone":
                return phoneValidator.isValidSync(input?.payload);
            default:
                return true;
        }
    };

    return { useThis, component: InputAction, validator, props: {} };
}
