import { Ref, ref } from "vue";

export function useFormattedNumber(
    value: number,
    locale = "en-US"
): {
    formatted: Ref<string>;
    value: Ref<number>;
} {
    const formattedNumber = new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
    }).format(value);

    return {
        formatted: ref(formattedNumber),
        value: ref(value),
    };
}
