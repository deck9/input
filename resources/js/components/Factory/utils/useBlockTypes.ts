import { ref, Ref } from "vue";

// the answer types as the type picker groups them, in the order of the list below
export const typeGroups: Array<{ label: string; types: FormBlockType[] }> = [
    {
        label: "Text",
        types: [
            "input-short",
            "input-long",
            "input-email",
            "input-link",
            "input-phone",
            "input-number",
            "input-secret",
        ],
    },
    { label: "Choice", types: ["radio", "checkbox"] },
    { label: "Rating", types: ["rating", "scale"] },
    { label: "Other", types: ["date", "input-file", "consent"] },
    { label: "Content", types: ["none"] },
];

export const useBlockTypes = (): {
    types: Ref<Array<InteractionOption>>;
} => {
    const rawTypes: Array<Omit<InteractionOption, "id">> = [
        { label: "Short text", value: "input-short", icon: "pencil" },
        { label: "Long text", value: "input-long", icon: "message" },
        { label: "Email", value: "input-email", icon: "envelope" },
        { label: "Link", value: "input-link", icon: "link" },
        { label: "Phone", value: "input-phone", icon: "phone" },
        { label: "Number", value: "input-number", icon: "sort-numeric-up" },
        { label: "Hidden text", value: "input-secret", icon: "eye-slash" },
        { label: "Single choice", value: "radio", icon: "circle-dot" },
        { label: "Checkboxes", value: "checkbox", icon: "check-square" },
        { label: "Rating", value: "rating", icon: "star" },
        { label: "Scale", value: "scale", icon: "signal" },
        { label: "Date", value: "date", icon: "calendar" },
        { label: "File upload", value: "input-file", icon: "cloud-arrow-up" },
        { label: "Consent", value: "consent", icon: "user-shield" },
        { label: "Text only", value: "none", icon: "heading" },
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
