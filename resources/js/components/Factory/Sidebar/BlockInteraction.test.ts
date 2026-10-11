import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import BlockInteraction from "./BlockInteraction.vue";

describe("BlockInteraction", () => {
    it.each(["range", "file"])(
        "mounts a new %s interaction whose options are still null",
        (type) => {
            const interaction = {
                type,
                label: null,
                options: null,
            } as unknown as FormBlockInteractionModel;

            expect(() =>
                mount(BlockInteraction, { props: { interaction } }),
            ).not.toThrow();
        },
    );
});
