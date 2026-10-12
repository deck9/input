import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import { cursorFor, useAddBlock } from "./blockFocus";

const open = { id: 3, uuid: "q3", type: "radio" } as FormBlockModel;
const added = { id: 4, uuid: "q4", type: "radio" } as FormBlockModel;

describe("adding a question", () => {
    beforeEach(() => {
        useWorkbench().$reset();
        cursorFor.value = null;
    });

    it("puts the cursor in the new question", async () => {
        const workbench = useWorkbench();
        workbench.block = open;
        vi.mocked(useForm().createFormBlock).mockImplementation(async () => {
            workbench.block = added;
        });

        await useAddBlock().addBlock(open);

        expect(cursorFor.value).toBe("q4");
    });

    it("leaves the cursor alone when the question can't be made", async () => {
        const workbench = useWorkbench();
        workbench.block = open;
        vi.mocked(useForm().createFormBlock).mockResolvedValue(undefined);

        await useAddBlock().addBlock(open);

        expect(cursorFor.value).toBeNull();
    });
});
