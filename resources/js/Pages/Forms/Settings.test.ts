import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { router } from "@inertiajs/vue3";
import Settings from "./Settings.vue";
import { finishBeforeReload } from "@/utils/useFreshFormAfterBack";

vi.mock("@inertiajs/vue3", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@inertiajs/vue3")>()),
    router: { on: vi.fn(), visit: vi.fn() },
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
    CompletionPage: true,
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

        expect(router.visit).toHaveBeenCalledWith(window.location.href, {
            only: ["form"],
            replace: true,
            preserveScroll: true,
        });
    });

    it("loads nothing more on a normal visit, also one after a Back", () => {
        // a Back to another page, then a link to Settings
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );
        expect(listensTo).toBe("before");
        onVisit(new CustomEvent("inertia:before"));

        mountSettings();

        expect(router.visit).not.toHaveBeenCalled();
    });

    it("skips the reload when you go elsewhere while a save on Back is on its way", async () => {
        let landed = () => {};
        finishBeforeReload(new Promise<void>((resolve) => (landed = resolve)));
        window.dispatchEvent(
            new PopStateEvent("popstate", { state: { component: "x" } }),
        );

        mountSettings();
        onVisit(new CustomEvent("inertia:before"));
        landed();
        await flushPromises();

        expect(router.visit).not.toHaveBeenCalled();
    });

    it("loads nothing more when only the tab in the address changes", () => {
        window.dispatchEvent(new PopStateEvent("popstate", { state: null }));

        mountSettings();

        expect(router.visit).not.toHaveBeenCalled();
    });
});
