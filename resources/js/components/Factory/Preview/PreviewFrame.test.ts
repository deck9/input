import {
    enableAutoUnmount,
    flushPromises,
    mount,
    type VueWrapper,
} from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, getActivePinia, setActivePinia, type Pinia } from "pinia";
import { PiniaDebounce } from "@pinia/plugin-debounce";
import debounce from "lodash/debounce";
import type { AxiosResponse } from "axios";
import { createApp, nextTick } from "vue";
import { useForm, useLogic, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import { callUpdateFormBlock } from "@/api/blocks";
import { callUpdateFormBlockInteraction } from "@/api/interactions";
import { endScreenOpen } from "@/components/Factory/Document/blockFocus";
import { END_SCREEN } from "@/forms/classic/previewTarget";
import PreviewFrame from "./PreviewFrame.vue";

vi.mock("@/api/blocks", () => ({ callUpdateFormBlock: vi.fn() }));
vi.mock("@/api/interactions", () => ({
    callUpdateFormBlockInteraction: vi.fn(),
}));
vi.mock("@/api/logics", () => ({
    callUpdateFormBlockLogic: vi.fn(async () => ({ status: 200, data: true })),
}));

// the form page is /<uuid>
window.route = ((name: string, params?: { uuid?: string }) =>
    `/${params?.uuid ?? name}`) as typeof window.route;

const block = (id: number, uuid: string, type = "input-short") =>
    ({
        id,
        uuid,
        type,
        title: "",
        interactions: [{ id: id * 10, label: "Red", options: [] }],
    }) as unknown as FormBlockModel;
const first = block(1, "q1uuid");
const second = block(2, "q2uuid");
const group = block(3, "g3uuid", "group");

// the testing pinia from the setup file: a test with a real one sets it back
const testing = getActivePinia() as Pinia;

// a real one, whose typing saves wait a second as in the app
const realPinia = () => {
    const pinia = createPinia();
    createApp({}).use(pinia);
    pinia.use(PiniaDebounce(debounce));
    setActivePinia(pinia);
    return pinia;
};

// the server answers each save when the test says so
const answers: Array<() => void> = [];
const answerLater = () =>
    new Promise<AxiosResponse>((resolve) =>
        answers.push(() => resolve({ status: 200 } as AxiosResponse)),
    );

enableAutoUnmount(afterEach);

const mountFrame = (open: FormBlockModel | null = first, pinia?: Pinia) => {
    useForm().form = { uuid: "form1" } as FormModel;
    // copies, which the editor changes
    useForm().blocks = structuredClone([first, second, group]);
    useWorkbench().block =
        useForm().blocks!.find((item) => item.uuid === open?.uuid) ?? null;

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
        answers.length = 0;
        endScreenOpen.value = false;
    });

    it("runs the public form in preview mode at the open question", () => {
        const iframe = mountFrame().get("iframe");

        expect(iframe.attributes("src")).toBe("/form1?preview=1&block=q1uuid");
        expect(iframe.attributes("title")).toBe("Preview of your form");
    });

    it("waits for the questions to load, so it starts at the open one instead of jumping there", async () => {
        useForm().form = { uuid: "form1" } as FormModel;
        useForm().blocks = null;
        useWorkbench().block = null;
        const wrapper = mount(PreviewFrame, { attachTo: document.body });
        expect(wrapper.find("iframe").exists()).toBe(false);

        useForm().blocks = structuredClone([first, second, group]);

        useWorkbench().block = second;
        await nextTick();

        expect(wrapper.get("iframe").attributes("src")).toBe(
            "/form1?preview=1&block=q2uuid",
        );
    });

    it("starts at once when it opens with no question open", () => {
        const iframe = mountFrame(null).get("iframe");

        expect(iframe.attributes("src")).toBe("/form1?preview=1");
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

    it("starts at the end screen while its card is open", () => {
        endScreenOpen.value = true;
        const iframe = mountFrame(null).get("iframe");

        expect(iframe.attributes("src")).toBe(`/form1?preview=1&block=${END_SCREEN}`);
    });

    it("goes to the end screen when its card opens, and back to a question opened after", async () => {
        const wrapper = mountFrame();
        const post = vi.spyOn(frameWindow(wrapper), "postMessage");

        // opening the card closes the open question first
        useWorkbench().block = null;
        endScreenOpen.value = true;
        await nextTick();
        expect(post).toHaveBeenLastCalledWith(
            { type: "input:preview:goto", block: END_SCREEN },
            window.location.origin,
        );

        useWorkbench().block = second;
        await nextTick();
        expect(post).toHaveBeenLastCalledWith(
            { type: "input:preview:goto", block: "q2uuid" },
            window.location.origin,
        );
    });

    it("loads the form again at the end screen after its save", async () => {
        const wrapper = mountFrame(null, realPinia());
        endScreenOpen.value = true;
        await nextTick();
        const before = wrapper.get("iframe").element;

        useNotice().clearSaveError("saveEndScreen");
        await nextTick();
        await nextTick();

        const iframe = wrapper.get("iframe");
        expect(iframe.element).not.toBe(before);
        expect(iframe.attributes("src")).toBe(`/form1?preview=1&block=${END_SCREEN}`);
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

    it("tells which question the preview shows", () => {
        const wrapper = mountFrame();

        fromFrame(wrapper, { type: "input:preview:block", block: "q1uuid" });
        fromFrame(wrapper, { type: "input:preview:block", block: "q2uuid" });

        expect(wrapper.emitted("update:shown")).toEqual([["q1uuid"], ["q2uuid"]]);
    });

    it("tells when the preview doesn't go to the open question, as when a rule hides it", async () => {
        vi.useFakeTimers();
        const wrapper = mountFrame();
        fromFrame(wrapper, { type: "input:preview:block", block: "q1uuid" });
        const missed = () => wrapper.emitted("update:missed")?.at(-1)?.[0] ?? null;

        // the preview moves: nothing missed
        useWorkbench().block = second;
        await nextTick();
        fromFrame(wrapper, { type: "input:preview:block", block: "q2uuid" });
        vi.advanceTimersByTime(500);
        expect(missed()).toBeNull();

        // it stays
        useWorkbench().block = first;
        await nextTick();
        vi.advanceTimersByTime(499);
        expect(missed()).toBeNull();
        vi.advanceTimersByTime(1);
        expect(missed()).toBe("q1uuid");
        vi.useRealTimers();
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
        ["a new choice", () => useNotice().clearSaveError("createInteraction:2")],
        [
            "a saved rule",
            () => {
                useLogic().block = second;
                return useLogic().saveSingleRule({ uuid: "r1" } as FormBlockLogic);
            },
        ],
    ])("loads the form again at the open question after %s", async (_, save) => {
        const wrapper = mountFrame(first, realPinia());
        const before = wrapper.get("iframe").element;

        useWorkbench().block = second;
        await save();
        await nextTick();
        await nextTick();

        const iframe = wrapper.get("iframe");
        expect(iframe.element).not.toBe(before);
        expect(iframe.attributes("src")).toBe("/form1?preview=1&block=q2uuid");
    });

    it("loads the form again after a delete, which takes the question out after its save", async () => {
        const wrapper = mountFrame(first, realPinia());
        const before = wrapper.get("iframe").element;

        useNotice().clearSaveError("deleteBlock:2");
        useForm().blocks!.splice(1, 1);
        await nextTick();
        await nextTick();

        expect(wrapper.get("iframe").element).not.toBe(before);
    });

    describe("while typing, which saves a second later", () => {
        beforeEach(() => {
            vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
            vi.mocked(callUpdateFormBlock).mockImplementation(answerLater);
            vi.mocked(callUpdateFormBlockInteraction).mockImplementation(
                answerLater,
            );
        });
        afterEach(() => vi.useRealTimers());

        it("shows two saves that overlap: the first comes back before the second is sent", async () => {
            const wrapper = mountFrame(first, realPinia());
            const frame = () => wrapper.get("iframe").element;
            const start = frame();

            useWorkbench().updateBlock({ title: "Your colour?" });
            await vi.advanceTimersByTimeAsync(500);
            useWorkbench().updateInteraction({ id: 10, label: "Green" });
            await vi.advanceTimersByTimeAsync(500);
            answers[0]();
            await flushPromises();
            const shown = frame();
            expect(shown).not.toBe(start);

            // the choice reached the server only now
            await vi.advanceTimersByTimeAsync(500);
            answers[1]();
            await flushPromises();
            expect(frame()).not.toBe(shown);
        });

        it("keeps running after a save that changed nothing", async () => {
            const wrapper = mountFrame(first, realPinia());
            const before = wrapper.get("iframe").element;

            // opening a card saves its answer field: empty settings come as [], go back as {}
            useWorkbench().updateInteraction({ id: 10, options: {} });
            await vi.advanceTimersByTimeAsync(1000);
            answers[0]();
            await flushPromises();

            expect(callUpdateFormBlockInteraction).toHaveBeenCalledOnce();
            expect(wrapper.get("iframe").element).toBe(before);
        });
    });
});
