import InputAction from "@/forms/classic/interactions/InputAction.vue";

export function useInputAction(block: PublicFormBlockModel) {
    const useThis = [
        "input-short",
        "input-email",
        "input-number",
        "input-link",
        "input-phone",
    ].includes(block.type);

    return { useThis, component: InputAction };
}
