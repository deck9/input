import { enableAutoUnmount, mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, getActivePinia, setActivePinia, type Pinia } from "pinia";
import { nextTick } from "vue";
import { useForm, useLogic, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import PreviewFrame from "./PreviewFrame.vue";

// the form page is /<uuid>
window.route = ((name: string, params?: { uuid?: string }) =>
    `/${params?.uuid ?? name}`) as typeof window.route;

const block = (id: number, uuid: string, type = "input-short") =>
    ({ id, uuid, type, interactions: [{ options: [] }] }) as unknown as FormBlockModel;
const first = block(1, "q1uuid");
const second = block(2, "q2uuid");
const group = block(3, "g3uuid", "group");

// the testing pinia from the setup file: a test with a real one sets it back
const testing = getActivePinia() as Pinia;

enableAutoUnmount(afterEach);

const mountFrame = (open: FormBlockModel | null = first, pinia?: Pinia) => {
    useForm().form = { uuid: "form1" } as FormModel;
    useForm().blocks = [{ ...first }, { ...second }, { ...group }];
    useWorkbench().block = open;

    return mount(PreviewFrame, {
        attachTo: document.body,
        global: pinia ? { plugins: [pinia] } : {},
    });
};

const frameWindow = (wrapper: VueWrapper) =>
    (wrapper.get("iframe").element as HTMLIFrameElement)
        .contentWindow as Window;

const fromFrame = (
    wrapper: VueWrapper,
    data: unknown,
    init: MessageEventInit = {},
) =>
    window.dispatchEvent(
        new MessageEvent("message", {
            data,
            origin: window.location.origin,
            source: frameWindow(wrapper),
            ...init,
        }),
    );

describe("the preview frame", () => {
    beforeEach(() => {
        setActivePinia(testing);
        vi.clearAllMocks();
    });

    it("runs the public form in preview mode at the open question", () => {
        const iframe = mountFrame().get("iframe");

        expect(iframe.attributes("src")).toBe("/form1?preview=1&block=q1uuid");
        expect(iframe.attributes("title")).toBe("Preview of your form");
    });

    it("starts at the first question when none is open", () => {
        expect(mountFrame(null).get("iframe").attributes("src")).toBe(
            "/form1?preview=1",
        );
    });

    it("goes to the question opened in the document", async () => {
        const wrapper = mountFrame();
        const post = vi.spyOn(frameWindow(wrapper), "postMessage");

        useWorkbench().block = second;
        await nextTick();

        expect(post).toHaveBeenCalledWith(
            { type: "input:preview:goto", block: "q2uuid" },
            window.location.origin,
        );
    });

    it("opens the question the preview moves on to", () => {
        const wrapper = mountFrame();

        fromFrame(wrapper, { type: "input:preview:block", block: "q1uuid" });
        fromFrame(wrapper, { type: "input:preview:block", block: "q2uuid" });

        expect(useWorkbench().putOnWorkbench).toHaveBeenCalledWith(second);
    });

    it("doesn't send that question back to the preview", async () => {
        const wrapper = mountFrame();
        const post = vi.spyOn(frameWindow(wrapper), "postMessage");

        fromFrame(wrapper, { type: "input:preview:block", block: "q1uuid" });
        fromFrame(wrapper, { type: "input:preview:block", block: "q2uuid" });
        // the stubbed action doesn't open it
        useWorkbench().block = second;
        await nextTick();

        expect(post).not.toHaveBeenCalled();
    });

    it("keeps the open group where the preview starts", () => {
        const wrapper = mountFrame(group);
        const post = vi.spyOn(frameWindow(wrapper), "postMessage");

        // a group is no page of the form: the preview starts at the first question
        fromFrame(wrapper, { type: "input:preview:block", block: "q1uuid" });

        expect(useWorkbench().putOnWorkbench).not.toHaveBeenCalled();
        // and asks for the open block again, it may have missed it while loading
        expect(post).toHaveBeenCalledWith(
            { type: "input:preview:goto", block: "g3uuid" },
            window.location.origin,
        );
    });

    it.each([
        ["another origin", { origin: "https://evil.example" }, {}],
        ["another window", { source: window }, {}],
        ["another type", {}, { type: "input:preview:goto" }],
        ["no block id", {}, { block: 2 }],
    ])("ignores a message from %s", (_, init, change) => {
        const wrapper = mountFrame();
        const data = { type: "input:preview:block", block: "q1uuid" };

        fromFrame(wrapper, data);
        fromFrame(wrapper, { ...data, block: "q2uuid", ...change }, init);

        expect(useWorkbench().putOnWorkbench).not.toHaveBeenCalled();
    });

    it.each([
        ["a save", () => useNotice().clearSaveError("saveBlock:1")],
        ["saved rules", () => useLogic().saveBlockLogic()],
    ])("loads the form again at the open question after %s", async (_, save) => {
        const pinia = createPinia();
        setActivePinia(pinia);
        const wrapper = mountFrame(first, pinia);
        const before = wrapper.get("iframe").element;

        useWorkbench().block = second;
        useForm().blocks![1].message = "<p>Changed</p>";
        await save();
        await nextTick();

        const iframe = wrapper.get("iframe");
        expect(iframe.element).not.toBe(before);
        expect(iframe.attributes("src")).toBe("/form1?preview=1&block=q2uuid");
    });

    it("keeps running after a save that changed nothing", async () => {
        const pinia = createPinia();
        setActivePinia(pinia);
        const wrapper = mountFrame(first, pinia);
        const before = wrapper.get("iframe").element;

        // opening a card saves its answer field: empty settings come as [], go back as {}
        useForm().blocks![0].interactions = [
            { options: {} },
        ] as unknown as FormBlockInteractionModel[];
        useNotice().clearSaveError("saveInteraction:1");
        await nextTick();

        expect(wrapper.get("iframe").element).toBe(before);
    });

    it("compares with the questions as they load, after the preview", async () => {
        const pinia = createPinia();
        setActivePinia(pinia);
        useForm().form = { uuid: "form1" } as FormModel;
        const wrapper = mount(PreviewFrame, {
            attachTo: document.body,
            global: { plugins: [pinia] },
        });
        const before = wrapper.get("iframe").element;

        useForm().blocks = [{ ...first }];
        await nextTick();
        useNotice().clearSaveError("saveInteraction:1");
        await nextTick();

        expect(wrapper.get("iframe").element).toBe(before);
    });
});
