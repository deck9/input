import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@inertiajs/vue3";
import { AxiosResponse } from "axios";
import { callGetForm } from "@/api/forms";
import { useForm } from "@/stores";
import Settings from "./Settings.vue";
import { trackFormSave } from "@/utils/useFreshForm";

vi.mock("@inertiajs/vue3", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@inertiajs/vue3")>()),
    router: { on: vi.fn() },
}));
vi.mock("@/api/forms", async (importOriginal) => ({
    ...(await importOriginal()),
    callGetForm: vi.fn(),
}));
// its code highlighter needs a global Vue
vi.mock("@/components/Factory/Settings/Embed.vue", () => ({
    default: { name: "Embed", template: "<div />" },
}));

const form = { uuid: "form1", name: "Customer feedback" } as FormModel;
// Settings listens for Inertia visits once, when it loads
const [listensTo, onVisit] = vi.mocked(router.on).mock.calls[0] ?? [];

const stubs = {
    AppLayout: { props: ["title"], template: "<main><slot /></main>" },
    Options: true,
    Privacy: true,
    // like the real one, it copies the form when it loads
    CompletionPage: {
        setup: () => ({ headline: useForm().form?.eoc_headline }),
        template: "<p>{{ headline }}</p>",
    },
    Appearance: true,
    Embed: true,
    TemplateExport: true,
    Delete: true,
};

let wrapper: VueWrapper | undefined;

const mountSettings = () => {
    wrapper = mount(Settings, { props: { form }, global: { stubs } });
};

describe("settings page from history", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(callGetForm).mockResolvedValue({
            data: form,
        } as AxiosResponse);
    });

    afterEach(() => {
        wrapper?.unmount();
        wrapper = undefined;
    });

    it("loads the form again when browser Back brings the page back", async () => {
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );

        mountSettings();
        await flushPromises();

        expect(callGetForm).toHaveBeenCalledTimes(1);
    });

    it("loads nothing more on a normal visit, also one after a Back", async () => {
        // a Back to another page, then a link to Settings
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        expect(listensTo).toBe("before");
        onVisit(new CustomEvent("inertia:before"));

        mountSettings();
        await flushPromises();

        expect(callGetForm).not.toHaveBeenCalled();
    });

    it("lets a visit started while a save is on its way win, and its page loads the form after the save", async () => {
        let landed = () => {};
        trackFormSave(new Promise<void>((resolve) => (landed = resolve)));
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        mountSettings();

        // you go to another page before the save lands
        onVisit(new CustomEvent("inertia:before"));
        wrapper?.unmount();
        mountSettings();
        landed();
        await flushPromises();

        expect(callGetForm).toHaveBeenCalledTimes(1);
    });

    it("loads nothing more when only the tab in the address changes", async () => {
        window.dispatchEvent(new PopStateEvent("popstate", { state: null }));

        mountSettings();
        await flushPromises();

        expect(callGetForm).not.toHaveBeenCalled();
    });

    it("keeps the tab you switch to while the form loads again", async () => {
        let landed = () => {};
        trackFormSave(new Promise<void>((resolve) => (landed = resolve)));
        vi.mocked(callGetForm).mockResolvedValue({
            data: { ...form, eoc_headline: "Thanks!" },
        } as AxiosResponse);
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        mountSettings();

        const tab = wrapper!.findAll("button[role=tab]")[2];
        await tab.trigger("click");
        landed();
        await flushPromises();

        expect(location.hash).toBe("#completion-page");
        expect(tab.attributes("aria-selected")).toBe("true");
        expect(wrapper!.text()).toContain("Thanks!");
    });
});
