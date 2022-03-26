import InputAction from "@/forms/classic/interactions/InputAction.vue";

export function useInputAction(block: PublicFormBlockModel) {
    const useThis = [
        "input-short",
        "input-email",
        "input-number",
        "input-link",
        "input-phone",
    ].includes(block.type);

    const validator = (input: any) => {
        switch (block.type) {
            case "input-email":
                return input?.payload?.length > 5;
            default:
                return true;
        }
    };

    return { useThis, component: InputAction, validator };
}
