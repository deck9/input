import { ref, Ref } from "vue";

function hexToRgb(hex?: string | null) {
    if (!hex) {
        return null;
    }

    const width = hex.length === 4 ? 1 : 2;
    const regex = new RegExp(
        `^#?([a-f\\d]{${width}})([a-f\\d]{${width}})([a-f\\d]{${width}})$`,
        "i"
    );
    const result = regex.exec(hex);

    if (result) {
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);

        return `${r}, ${g}, ${b}`;
    }

    return null;
}

export function useThemableColor(color?: string | null): Ref<string> {
    const result = hexToRgb(color);

    return result ? ref(result) : ref("");
}
