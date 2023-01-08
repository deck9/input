import { config, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it } from "vitest";
import ButtonAction from "./ButtonAction.vue";

describe("ButtonAction", () => {
    beforeEach(() => {
        config.global.provide = {
            disableFocus: false,
        };
    });

    const defaultBlock = {
        id: "1",
        type: "radio",
    } as Partial<PublicFormBlockModel>;

    const defaultAction = {
        id: "1",
        uuid: "test",
        type: "button",
        is_editable: true,
        is_disabled: false,
        label: "Test Button",
        form_block_id: 1,
    } as Partial<PublicFormBlockInteractionModel>;

    it("should mount correctly", () => {
        const wrapper = mount(ButtonAction, {
            props: { index: 0, block: defaultBlock, action: defaultAction },
        });

        expect(wrapper.html()).toMatchSnapshot();
    });

    it("should have correct labels displayed", () => {
        const wrapper = mount(ButtonAction, {
            props: {
                index: 0,
                block: defaultBlock,
                action: { ...defaultAction, label: "Test Button Label" },
            },
        });

        expect(wrapper.find("[data-testid='button-action-index']").text()).toBe(
            "1"
        );

        expect(wrapper.find("[data-testid='button-label']").text()).toBe(
            "Test Button Label"
        );
    });
});
