import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Edit from "./Edit.vue";
import { useForm, useWorkbench } from "@/stores";

const form = { uuid: "form1", name: "Customer feedback" } as FormModel;
const blocks = [
    { id: 1, uuid: "b1", type: "none" },
    { id: 2, uuid: "b2", type: "none" },
] as FormBlockModel[];

const stubs = {
    AppLayout: { props: ["title"], template: "<main><slot /></main>" },
    BlockContainer: { template: "<ol><li>questions</li></ol>" },
    BlockLogicEditor: true,
    Workbench: true,
};

let wrapper: VueWrapper | undefined;

// the test pinia stubs actions: getBlocks does what each test tells it to
const mountEditor = async (load: () => Promise<void>) => {
    vi.mocked(useForm().getBlocks).mockImplementation(load);
    wrapper = mount(Edit, { props: { form }, global: { stubs } });
    await flushPromises();
    return wrapper;
};
const loads = (result: FormBlockModel[]) => async () => {
    useForm().blocks = result;
};

describe("editor loading", () => {
    beforeEach(() => {
        useForm().$reset();
        useWorkbench().$reset();
        vi.clearAllMocks();
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it("shows skeletons while the questions load, never the empty-form text", async () => {
        const editor = await mountEditor(() => new Promise(() => {}));

        expect(editor.get("[role=status]").text()).toBe("Loading questions");
        expect(editor.text()).not.toContain("Welcome to the Editor");
        expect(editor.text()).not.toContain("No blocks found");
        expect(editor.find("[role=alert]").exists()).toBe(false);
    });

    it("says when the questions can't load, and Try again loads them", async () => {
        const getBlocks = vi.mocked(useForm().getBlocks);
        const editor = await mountEditor(() => Promise.reject(new Error("500")));

        const alert = editor.get("[role=alert]");
        expect(alert.text()).toContain("Couldn't load the questions.");
        expect(editor.text()).not.toContain("Welcome to the Editor");
        expect(editor.text()).not.toContain("No blocks found");

        getBlocks.mockImplementation(loads(blocks));
        await alert.get("button").trigger("click");
        await flushPromises();

        expect(getBlocks).toHaveBeenCalledTimes(2);
        expect(editor.find("[role=alert]").exists()).toBe(false);
        expect(editor.find("[role=status]").exists()).toBe(false);
        expect(editor.text()).toContain("questions");
        expect(useWorkbench().putOnWorkbench).toHaveBeenCalledWith(blocks[0]);
    });

    it("shows the empty-form text for a loaded form without questions", async () => {
        const editor = await mountEditor(loads([]));

        expect(editor.text()).toContain("Welcome to the Editor");
        expect(editor.text()).toContain("No blocks found");
        expect(editor.find("[role=status]").exists()).toBe(false);
    });

    it("hides the empty-form text when the form has questions but none is open", async () => {
        // putOnWorkbench is a stub, so no question opens, like after deleting the open one
        const editor = await mountEditor(loads(blocks));

        expect(editor.text()).toContain("questions");
        expect(editor.text()).not.toContain("Welcome to the Editor");
    });
});
