import { describe, expect, it, vi } from "vitest";
import { useInputAction } from "./useInputAction";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

describe("useInputAction", () => {
    const numberBlock = {
        id: "1",
        type: "input-number",
        is_required: true,
    } as PublicFormBlockModel;

    it.each([150, 100000])("accepts the number %d", (payload) => {
        const { validator } = useInputAction(numberBlock);

        expect(validator({ payload, actionId: "1" }).valid).toBe(true);
    });
});
