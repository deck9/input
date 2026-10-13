import { createPinia, setActivePinia } from "pinia";
import { nextTick } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm } from "@/stores";
import { moveNote, useMoveBlock } from "./blockMove";

vi.mock("@/api/blocks", async (original) => ({
    ...(await original<object>()),
    callUpdateBlockSequence: vi.fn().mockResolvedValue({ status: 204 }),
}));

const make = () =>
    [
        { id: 1, uuid: "q1", type: "radio" },
        { id: 2, uuid: "q2", type: "radio" },
        { id: 3, uuid: "g1", type: "group", title: "Food" },
        { id: 4, uuid: "c1", type: "radio", parent_block: "g1" },
        { id: 5, uuid: "c2", type: "radio", parent_block: "g1" },
        { id: 6, uuid: "q3", type: "radio" },
    ] as FormBlockModel[];

// the document's order: top-level blocks, a group's questions after it
const order = () => {
    const blocks = useForm().blocks ?? [];

    return blocks
        .filter((block) => !block.parent_block)
        .map((block) =>
            block.type === "group"
                ? `${block.uuid}[${blocks
                      .filter((child) => child.parent_block === block.uuid)
                      .map((child) => child.uuid)
                      .join(" ")}]`
                : block.uuid,
        )
        .join(" ");
};

const move = async (uuid: string, step: -1 | 1) => {
    const block = useForm().blocks!.find((item) => item.uuid === uuid)!;
    const moved = await useMoveBlock().moveBlock(block, step);
    await nextTick();

    return moved;
};

describe("moving a block one step", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        useForm().form = { uuid: "f1" } as FormModel;
        useForm().blocks = make();
    });

    it("swaps a question with its neighbour and says where it went", async () => {
        expect(await move("q1", 1)).toBe(true);

        expect(order()).toBe("q2 q1 g1[c1 c2] q3");
        expect(moveNote.value).toBe("Moved to position 2 of 5");
    });

    it("steps a question into a group next to it", async () => {
        await move("q2", 1);
        expect(order()).toBe("q1 g1[q2 c1 c2] q3");
        expect(moveNote.value).toBe("Moved into group Food, to position 2 of 5");

        await move("q3", -1);
        expect(order()).toBe("q1 g1[q2 c1 c2 q3]");
        expect(moveNote.value).toBe("Moved into group Food, to position 5 of 5");
    });

    it("steps a question out at the ends of its group", async () => {
        await move("c1", -1);
        expect(order()).toBe("q1 q2 c1 g1[c2] q3");
        expect(moveNote.value).toBe(
            "Moved out of group Food, to position 3 of 5",
        );

        await move("c2", 1);
        expect(order()).toBe("q1 q2 c1 g1[] c2 q3");
        expect(moveNote.value).toBe(
            "Moved out of group Food, to position 4 of 5",
        );
    });

    it("moves a group over a whole block, with its questions", async () => {
        await move("g1", -1);

        expect(order()).toBe("q1 g1[c1 c2] q2 q3");
        expect(moveNote.value).toBe("Moved group Food to position 2 of 4");
    });

    it("stays put at the top and the bottom, and says so", async () => {
        const { canMove } = useMoveBlock();
        const [first, , , , , last] = useForm().blocks!;

        expect(canMove(first, -1)).toBe(false);
        expect(canMove(last, 1)).toBe(false);
        expect(canMove(first, 1)).toBe(true);

        expect(await move("q1", -1)).toBe(false);
        expect(moveNote.value).toBe("Already at the top");
        expect(await move("q3", 1)).toBe(false);
        expect(moveNote.value).toBe("Already at the bottom");
        expect(order()).toBe("q1 q2 g1[c1 c2] q3");
    });
});
