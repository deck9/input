import { mount } from "@vue/test-utils";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import { describe, expect, it } from "vitest";
import RangeAction from "./RangeAction.vue";

library.add(faHeart, faStar);

const mountWithIcon = (icon: string) =>
    mount(RangeAction, {
        props: {
            index: 0,
            block: { id: "1", type: "rating" } as Partial<PublicFormBlockModel>,
            action: {
                id: "1",
                type: "range",
                options: { start: 1, end: 3, icon },
            } as Partial<PublicFormBlockInteractionModel>,
        },
    });

describe("RangeAction", () => {
    it("shows the saved rating icon", () => {
        const wrapper = mountWithIcon("heart");

        expect(wrapper.findAll("svg[data-icon='heart']")).toHaveLength(3);
    });

    it("falls back to the star when the saved icon isn't registered", () => {
        const wrapper = mountWithIcon("not-an-icon");

        expect(wrapper.findAll("svg[data-icon='star']")).toHaveLength(3);
    });
});
