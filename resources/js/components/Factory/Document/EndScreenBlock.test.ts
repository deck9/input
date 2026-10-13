import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callGetForm, callUpdateForm } from "@/api/forms";
import { useForm, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import { useFreshForm } from "@/utils/useFreshForm";
import CompletionPage from "@/components/Factory/Settings/CompletionPage.vue";
import EndScreenBlock from "./EndScreenBlock.vue";

vi.mock("@/api/forms", async (importOriginal) => ({
    ...(await importOriginal()),
    callGetForm: vi.fn(),
    callUpdateForm: vi.fn(),
}));

const form = {
    uuid: "form1",
    eoc_headline: "See you on Thursday!",
    eoc_text: "<p>We sent your ticket to your inbox.</p>",
    show_cta_link: true,
    cta_label: "Add to calendar",
    cta_link: "https://example.com/cal",
    use_cta_redirect: false,
} as FormModel;

let pinia: ReturnType<typeof createPinia>;
let wrapper: VueWrapper | undefined;

// real actions, not the stubs of the global testing pinia
const mountBlock = () => {
    wrapper = mount(EndScreenBlock, {
        attachTo: document.body,
        global: { plugins: [pinia], directives: { tooltip: {} } },
    });
    return wrapper;
};

const open = async () => {
    const block = mountBlock();
    await block.find("button").trigger("click");
    await vi.waitFor(() =>
        expect(block.find("[role=textbox]").exists()).toBe(true),
    );
    return block;
};

describe("the end screen in the document", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.route = (() => "/settings") as unknown as typeof window.route;
        pinia = createPinia();
        setActivePinia(pinia);
        useForm().form = { ...form };
        // the server answers with the form as it saved it
        vi.mocked(callUpdateForm).mockImplementation(
            async (_, values) =>
                ({
                    data: { ...useForm().form, ...values },
                }) as AxiosResponse,
        );
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it("shows its headline, text and button when closed", () => {
        const text = mountBlock().find("button").text();

        expect(text).toContain("See you on Thursday!");
        expect(text).toContain("End screen");
        expect(text).toContain("We sent your ticket to your inbox.");
        expect(text).toContain("Button: Add to calendar");
    });

    it("shows the default headline people see when it has none", async () => {
        useForm().form = { ...form, eoc_headline: null, show_cta_link: false };
        const text = mountBlock().find("button").text();

        expect(text).toContain("Form Submitted · default");
        expect(text).not.toContain("Button:");

        const block = await open();
        expect(
            block.find("#end-screen-headline").attributes("placeholder"),
        ).toBe("Form Submitted");
    });

    it("opens in place, closes the open question, and closes when a question opens", async () => {
        const workbench = useWorkbench();
        workbench.block = { id: 4, uuid: "q4" } as FormBlockModel;

        const block = await open();

        expect(workbench.block).toBeNull();
        const headline = block.find<HTMLInputElement>("#end-screen-headline");
        expect(headline.element.value).toBe("See you on Thursday!");
        expect(document.activeElement).toBe(headline.element);
        expect(block.find("label[for=end-screen-headline]").text()).toBe(
            "End screen headline",
        );
        expect(block.find("#end-screen-text-label").text()).toBe(
            "End screen text",
        );

        workbench.block = { id: 5, uuid: "q5" } as FormBlockModel;
        await flushPromises();

        expect(block.find("#end-screen-headline").exists()).toBe(false);
    });

    it("saves only what changed, right away when you leave the block", async () => {
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout", {
            relatedTarget: block.find("#end-screen-button").element,
        });
        await flushPromises();
        expect(callUpdateForm).not.toHaveBeenCalled();

        await block.find("#end-screen-headline").trigger("focusout");
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledTimes(1);
        expect(callUpdateForm).toHaveBeenCalledWith(
            expect.objectContaining({ uuid: "form1" }),
            { eoc_headline: "Thanks!" },
            undefined,
        );
        expect(useForm().form?.eoc_headline).toBe("Thanks!");
    });

    it("saves right away when the focus moves to the Settings link in the block", async () => {
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout", {
            relatedTarget: block.find("a").element,
        });
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledWith(
            expect.anything(),
            { eoc_headline: "Thanks!" },
            undefined,
        );
    });

    it("saves right away on browser Back", async () => {
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        window.dispatchEvent(new PopStateEvent("popstate"));
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledWith(
            expect.anything(),
            { eoc_headline: "Thanks!" },
            undefined,
        );
    });

    it("lets the next page load the form again only after the save made on Back", async () => {
        vi.mocked(callGetForm).mockImplementation(
            async () =>
                ({
                    data: useForm().form,
                }) as AxiosResponse,
        );
        let answer = () => {};
        vi.mocked(callUpdateForm).mockImplementation(
            (_, values) =>
                new Promise((resolve) => {
                    answer = () =>
                        resolve({
                            data: { ...useForm().form, ...values },
                        } as AxiosResponse);
                }),
        );
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        // the page Back goes to
        useFreshForm();
        await flushPromises();
        expect(callGetForm).not.toHaveBeenCalled();

        answer();
        await flushPromises();
        expect(callGetForm).toHaveBeenCalledTimes(1);
    });

    it("lets a page opened by a link while the save is on its way load the form again after it", async () => {
        vi.mocked(callGetForm).mockImplementation(
            async () =>
                ({
                    data: useForm().form,
                }) as AxiosResponse,
        );
        let answer = () => {};
        vi.mocked(callUpdateForm).mockImplementation(
            (_, values) =>
                new Promise((resolve) => {
                    answer = () =>
                        resolve({
                            data: { ...useForm().form, ...values },
                        } as AxiosResponse);
                }),
        );
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout");
        // the link's visit starts, and its page loads
        document.dispatchEvent(
            new CustomEvent("inertia:before", { detail: { visit: {} } }),
        );
        useFreshForm();
        await flushPromises();
        expect(callGetForm).not.toHaveBeenCalled();

        answer();
        await flushPromises();
        expect(callGetForm).toHaveBeenCalledTimes(1);
    });

    it("opens with the form loaded again after Back, not the older one the page came with", async () => {
        let answer = () => {};
        vi.mocked(callGetForm).mockImplementation(
            () =>
                new Promise((resolve) => {
                    answer = () =>
                        resolve({
                            data: { ...form, eoc_headline: "Thanks!" },
                        } as AxiosResponse);
                }),
        );
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        // the page Back goes to
        useFreshForm();
        const block = mountBlock();
        await flushPromises();

        await block.find("button").trigger("click");
        answer();
        await vi.waitFor(() =>
            expect(block.find("#end-screen-headline").exists()).toBe(true),
        );

        expect(
            block.get<HTMLInputElement>("#end-screen-headline").element.value,
        ).toBe("Thanks!");
    });

    it("saves on its own after a short pause while you type", async () => {
        vi.useFakeTimers();
        try {
            const block = await open();

            await block.find("#end-screen-headline").setValue("Thanks!");
            vi.advanceTimersByTime(1000);
            await flushPromises();

            expect(callUpdateForm).toHaveBeenCalledWith(
                expect.anything(),
                { eoc_headline: "Thanks!" },
                undefined,
            );
        } finally {
            vi.useRealTimers();
        }
    });

    it("edits the button: off hides its text and link", async () => {
        const block = await open();

        expect(block.find("#end-screen-button-label-label").text()).toBe(
            "Button text",
        );

        expect(
            block.find<HTMLInputElement>("#end-screen-button-label").element
                .value,
        ).toBe("Add to calendar");
        expect(
            block.find<HTMLInputElement>("#end-screen-button-link").element
                .value,
        ).toBe("https://example.com/cal");

        await block.find("#end-screen-button-link").setValue("mailto:a@b.co");
        await block.find("#end-screen-button").trigger("click");
        await block.find("#end-screen-button").trigger("focusout");
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledWith(
            expect.anything(),
            { cta_link: "mailto:a@b.co", show_cta_link: false },
            undefined,
        );
        expect(block.find("#end-screen-button-label").exists()).toBe(false);
    });

    it("shows the server's reason when a save is refused", async () => {
        const refused = new AxiosError(
            "Unprocessable",
            undefined,
            undefined,
            undefined,
            {
                status: 422,
                data: { message: "The cta link field format is invalid." },
            } as AxiosResponse,
        );
        vi.mocked(callUpdateForm).mockRejectedValue(refused);
        const block = await open();

        await block.find("#end-screen-button-link").setValue("example.com");
        await block.find("#end-screen-button-link").trigger("focusout");
        await flushPromises();

        expect(useNotice().message).toBe(
            "Your change wasn't saved: The cta link field format is invalid.",
        );
        expect(useForm().form?.cta_link).toBe("https://example.com/cal");
    });

    it("shows Saving in the save status from the first key until the save lands", async () => {
        let answer = () => {};
        vi.mocked(callUpdateForm).mockImplementation(
            (_, values) =>
                new Promise((resolve) => {
                    answer = () =>
                        resolve({
                            data: { ...useForm().form, ...values },
                        } as AxiosResponse);
                }),
        );
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        expect(useNotice().saveStatus).toBe("saving");

        await block.find("#end-screen-headline").trigger("focusout");
        expect(useNotice().saveStatus).toBe("saving");

        answer();
        await flushPromises();
        expect(useNotice().saveStatus).toBe("idle");
    });

    it("sends a refused change again on Retry", async () => {
        vi.mocked(callUpdateForm).mockRejectedValueOnce(new AxiosError());
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout");
        await flushPromises();
        expect(useNotice().saveStatus).toBe("failed");

        useNotice().retrySaves();
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledTimes(2);
        expect(useForm().form?.eoc_headline).toBe("Thanks!");
        expect(useNotice().saveStatus).toBe("idle");
    });

    it("sends a Retry only to the form it was made in", async () => {
        vi.mocked(callUpdateForm).mockRejectedValueOnce(new AxiosError());
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout");
        await flushPromises();
        // you open another form, then click Retry
        block.unmount();
        wrapper = undefined;
        useForm().form = { ...form, uuid: "form2" };
        useNotice().retrySaves();
        await flushPromises();

        expect(callUpdateForm).toHaveBeenCalledTimes(1);
    });

    it("stops showing Saving when it closes with a change still in its pause", async () => {
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        block.unmount();
        wrapper = undefined;

        expect(useNotice().saveStatus).toBe("idle");
    });

    it("sends a change still in its pause when the page closes, so it outlives the page", async () => {
        const block = await open();

        await block.find("#end-screen-headline").setValue("Thanks!");
        window.dispatchEvent(new Event("pagehide"));

        expect(callUpdateForm).toHaveBeenCalledWith(
            expect.anything(),
            { eoc_headline: "Thanks!" },
            { adapter: "fetch", fetchOptions: { keepalive: true } },
        );
    });

    it("only links to Settings while the form sends people to a link instead", () => {
        useForm().form = { ...form, use_cta_redirect: true };
        const block = mountBlock();

        expect(block.find("button").exists()).toBe(false);
        expect(block.text()).toContain("https://example.com/cal");
        expect(block.find("a").attributes("href")).toBe(
            "/settings#completion-page",
        );
    });

    it("stays in step with the Settings page through the form store", async () => {
        const block = await open();
        await block.find("#end-screen-headline").setValue("Thanks!");
        await block.find("#end-screen-headline").trigger("focusout");
        await flushPromises();

        const settings = mount(CompletionPage, {
            global: { plugins: [pinia], directives: { tooltip: {} } },
        });
        expect(
            settings.find<HTMLInputElement>("#eoc-headline").element.value,
        ).toBe("Thanks!");

        await settings.find("#eoc-headline").setValue("Bye!");
        await settings.find("form").trigger("submit");
        await flushPromises();
        settings.unmount();

        // closed, the block shows the saved headline without a reload
        useWorkbench().block = { id: 5, uuid: "q5" } as FormBlockModel;
        await flushPromises();
        expect(block.find("button").text()).toContain("Bye!");
    });
});
