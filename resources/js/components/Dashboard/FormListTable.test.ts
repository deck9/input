import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import FormListTable from "./FormListTable.vue";

const copy = vi.fn();
const announcement = { text: "Contact is live.", copy };

const FormListItem = {
    emits: ["announce"],
    setup: () => ({ announcement }),
    template: "<li><button @click=\"$emit('announce', announcement)\">Publish</button></li>",
};

describe("form list messages", () => {
    it("reads out what a row did and offers its button", async () => {
        const wrapper = mount(FormListTable, {
            props: { forms: [{ id: 1 } as FormModel] },
            global: { stubs: { FormListItem } },
        });
        const status = wrapper.find("[role=status]");
        expect(status.text()).toBe("");

        await wrapper.find("li button").trigger("click");
        expect(status.text()).toContain("Contact is live.");

        await status.find("button").trigger("click");
        expect(copy).toHaveBeenCalled();
    });

    it("hides the message after 5 seconds", async () => {
        vi.useFakeTimers();
        const wrapper = mount(FormListTable, {
            props: { forms: [{ id: 1 } as FormModel] },
            global: { stubs: { FormListItem } },
        });

        await wrapper.find("li button").trigger("click");
        await vi.advanceTimersByTimeAsync(5000);

        expect(wrapper.find("[role=status]").text()).toBe("");
        vi.useRealTimers();
    });
});
