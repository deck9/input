import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import ClassicForm from "@/forms/classic/ClassicForm.vue";
import { defineComponent, Suspense, h } from "vue";

const flags: EmbedFlags = {
    hideTitle: false,
    hideNavigation: false,
    autofocus: false,
    alignLeft: false,
};

const Wrapper = defineComponent({
    setup() {
        return {
            flags,
            settings: "test-form",
        };
    },
    render(props: any) {
        return h(Suspense, null, {
            default: h(ClassicForm, {
                settings: props.settings,
                flags: props.flags,
            }),
        });
    },
});

describe("ClassicForm", () => {
    it("mounts correctly", async () => {
        const wrapper = mount(Wrapper);
        expect(wrapper.text()).empty;
    });
});
