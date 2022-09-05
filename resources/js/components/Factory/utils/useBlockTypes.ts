import { ref, Ref } from "vue";

export const useBlockTypes = (): {
    types: Ref<Array<InteractionOption>>;
} => {
    const rawTypes: Array<InteractionOption> = [
        { label: "No Input", value: "none", icon: "envelope" },
        { label: "Multiple Choice", value: "radio", icon: "check-circle" },
        { label: "Checkboxes", value: "checkbox", icon: "check-square" },
        { label: "Short Answer", value: "input-short", icon: "pencil" },
        { label: "Long Answer", value: "input-long", icon: "message" },
        { label: "Number", value: "input-number", icon: "hashtag" },
        { label: "Email", value: "input-email", icon: "at" },
        { label: "Link", value: "input-link", icon: "link" },
        { label: "Phone Number", value: "input-phone", icon: "phone" },
        { label: "Consent", value: "consent", icon: "user-shield" },
    ];

    const types: Ref<Array<InteractionOption>> = ref(
        rawTypes.map((type, index) => {
            return {
                ...type,
                id: index,
            };
        })
    ) as Ref<Array<InteractionOption>>;

    return { types };
};
