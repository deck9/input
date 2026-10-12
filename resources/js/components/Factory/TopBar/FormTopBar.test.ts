import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import type { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormTopBar from "./FormTopBar.vue";
import FormPageTabs from "./FormPageTabs.vue";
import AccountMenu from "./AccountMenu.vue";
import { callGetFormBlocks } from "@/api/blocks";
import { useForm } from "@/stores";

const copy = vi.fn();
vi.mock("@vueuse/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useClipboard: () => ({ copy, copied: false }),
}));

vi.mock("@/api/blocks", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/api/blocks")>()),
    callGetFormBlocks: vi.fn(),
}));

// the headlessui dialog and menu need it, jsdom has none
vi.stubGlobal(
    "ResizeObserver",
    class {
        observe() {}
        unobserve() {}
        disconnect() {}
    },
);

// every route points to /<name>, so the current page is set by the url
const route = (name: string) => `${location.origin}/${name}`;
window.route = route as typeof window.route;

const $page = {
    props: {
        auth: {
            user: {
                name: "Mara Jensen",
                email: "mara@example.org",
                current_team: { name: "Hamburg Open Source" },
            },
        },
        jetstream: { hasApiFeatures: true },
    },
};

// Inertia's Link: a click starts a page visit
const inertiaLink = {
    props: ["href"],
    emits: ["start"],
    template: "<a :href='href' data-inertia @click.prevent=\"$emit('start')\"><slot /></a>",
};

const block = (uuid: string, message: string, logics: unknown[] = []) =>
    ({ uuid, type: "input-short", message, logics }) as FormBlockModel;

const mountOnPage = async (
    component,
    form: Partial<FormModel> = {},
    blocks: FormBlockModel[] | null = [],
) => {
    history.replaceState(null, "", "/forms.edit");

    const wrapper = mount(component, {
        attachTo: document.body,
        slots: {
            "save-status": "<span>Saved</span>",
            preview: "<button type='button'>Preview</button>",
        },
        global: {
            mocks: { $page, route },
            stubs: { Link: inertiaLink },
        },
    });
    // the test pinia stubs actions, so set the state directly
    useForm().$patch({
        form: {
            uuid: "form1",
            name: "Meetup RSVP",
            is_published: false,
            privacy_link: null,
            completed_sessions: 24,
            ...form,
        } as FormModel,
        blocks,
    });
    await wrapper.vm.$nextTick();

    return wrapper;
};

const text = (el: Element | null) => el?.textContent?.replace(/\s+/g, " ").trim();

// a mounted bar from an earlier test still follows the store
enableAutoUnmount(afterEach);

beforeEach(() => {
    document.body.innerHTML = "";
});

describe("form top bar", () => {
    it("holds the breadcrumb, the 4 pages, the save status and preview slots, one main button and the account", async () => {
        const wrapper = await mountOnPage(FormTopBar);
        const crumbs = wrapper.get('nav[aria-label="Breadcrumb"]');
        const team = crumbs.findAll("span").find((s) => s.text() === "Hamburg Open Source");
        const tabs = wrapper.get('nav[aria-label="Form pages"]').findAll("a");

        expect(wrapper.findAll("header")).toHaveLength(1);
        expect(crumbs.find('a[aria-label="All forms"]').exists()).toBe(true);
        // hidden under 1280 px: it's also in the account menu
        expect(team?.classes()).toEqual(expect.arrayContaining(["hidden", "xl:block"]));
        expect(crumbs.text()).toContain("Meetup RSVP");
        expect(crumbs.text()).toContain("Draft");
        expect(tabs.map((tab) => text(tab.element))).toEqual([
            "Editor",
            "Settings",
            "Integrations",
            "Submissions, 24",
        ]);
        expect(tabs[0].attributes("aria-current")).toBe("page");
        expect(wrapper.text()).toContain("Saved");
        expect(wrapper.find("button").exists()).toBe(true);
        expect(wrapper.findAll("button").map((b) => b.text())).toContain("Preview");
        expect(wrapper.findAll("button").map((b) => b.text())).toContain("Publish");
        expect(wrapper.text()).not.toContain("Share");
        expect(text(wrapper.get('[aria-haspopup="menu"]').element)).toBe(
            "Form menu: Meetup RSVP",
        );
        expect(wrapper.text()).toContain("Account: Mara Jensen");
    });

    it("checks the form before it publishes: questions without text, broken rules, privacy and the live note", async () => {
        const blocks = [
            block("q1", "<p>Your name?</p>", [
                { action: "goto", action_payload: "gone", conditions: [] },
            ]),
            block("q2", "<p></p>"),
            { uuid: "g1", type: "group", message: null } as FormBlockModel,
            block("q3", "<p>Bringing a friend?</p>", [
                { action: "show", action_payload: null, conditions: [{ source: "q1" }] },
            ]),
        ];
        const wrapper = await mountOnPage(FormTopBar, {}, blocks);
        const store = useForm();
        vi.mocked(store.publishForm).mockClear();

        const publish = wrapper.findAll("button").find((b) => b.text() === "Publish");
        await publish?.trigger("click");

        const dialog = document.querySelector('[role="dialog"]');
        expect(text(dialog)).toContain('Publish "Meetup RSVP"?');
        expect(text(dialog)).toContain("Warning: 3 questions, 1 without text");
        expect(text(dialog)).toContain(
            "Warning: 2 rules, 1 points to a question that no longer exists",
        );
        expect(text(dialog)).toContain("Note: No privacy page linked.");
        expect(text(dialog)).toContain("every change you make goes live at once");
        expect(store.publishForm).not.toHaveBeenCalled();

        const confirm = [...dialog!.querySelectorAll("button")].find(
            (b) => text(b) === "Publish",
        );
        confirm?.click();
        expect(store.publishForm).toHaveBeenCalledTimes(1);
    });

    it("opens the check on Cancel, not on the Settings link in the middle", async () => {
        const wrapper = await mountOnPage(FormTopBar, {}, [block("q1", "<p>Your name?</p>")]);

        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");
        await flushPromises();

        expect(text(document.activeElement)).toBe("Cancel");
    });

    it("takes the privacy note to Settings with a page visit, and closes the check", async () => {
        const wrapper = await mountOnPage(FormTopBar, {}, [block("q1", "<p>Your name?</p>")]);

        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");
        const settings = [...document.querySelectorAll('[role="dialog"] a')].find(
            (a) => text(a) === "Settings",
        );
        // a visit loads the page again, so Settings opens Privacy even from Settings
        expect(settings?.hasAttribute("data-inertia")).toBe(true);
        expect(settings?.getAttribute("href")).toBe(
            `${location.origin}/forms.settings#privacy`,
        );

        settings?.dispatchEvent(new MouseEvent("click", { cancelable: true }));
        await flushPromises();
        expect(text(document.body)).not.toContain('Publish "Meetup RSVP"?');
    });

    it("says all is well when every question has text and every rule works", async () => {
        const blocks = [
            block("q1", "<p>Your name?</p>"),
            block("q2", "<p>Coming?</p>", [
                { action: "show", action_payload: null, conditions: [{ source: "q1" }] },
            ]),
        ];
        const wrapper = await mountOnPage(
            FormTopBar,
            { privacy_link: "https://example.org/privacy" },
            blocks,
        );

        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");

        const dialog = text(document.querySelector('[role="dialog"]'));
        expect(dialog).toContain("2 questions, all with text");
        expect(dialog).toContain("1 rule, working");
        expect(dialog).not.toContain("Warning");
        expect(dialog).not.toContain("privacy");
    });

    it("fetches the rules for the check when the page loaded the blocks without them", async () => {
        // Submissions loads the blocks with their answers, but without their rules
        const withoutRules = { uuid: "q1", type: "input-short", message: "<p>Your name?</p>" };
        vi.mocked(callGetFormBlocks).mockResolvedValueOnce({
            data: [block("q1", "<p>Your name?</p>", [
                { action: "goto", action_payload: "gone", conditions: [] },
            ])],
        } as AxiosResponse<FormBlockModel[]>);
        const wrapper = await mountOnPage(FormTopBar, {}, [withoutRules as FormBlockModel]);

        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");
        await flushPromises();

        expect(callGetFormBlocks).toHaveBeenCalledWith("form1");
        expect(text(document.querySelector('[role="dialog"]'))).toContain(
            "Warning: 1 rule, 1 points to a question that no longer exists",
        );
    });

    it("holds Publish until the check is done, and offers to check again when it fails", async () => {
        let fail = () => {};
        vi.mocked(callGetFormBlocks)
            .mockReturnValueOnce(new Promise((_, reject) => (fail = reject)))
            .mockResolvedValueOnce({
                data: [block("q1", "<p>Your name?</p>")],
            } as AxiosResponse<FormBlockModel[]>);
        // Settings, Integrations: the page has no blocks
        const wrapper = await mountOnPage(FormTopBar, {}, null);
        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");

        const dialog = document.querySelector('[role="dialog"]');
        const button = (label: string) =>
            [...dialog!.querySelectorAll("button")].find((b) => text(b) === label);
        expect(text(dialog)).toContain("Checking your form…");
        expect(button("Publish")?.disabled).toBe(true);

        fail();
        await flushPromises();
        expect(dialog?.querySelector('[role="alert"]')?.textContent).toContain(
            "Couldn't check the questions and rules.",
        );
        expect(button("Publish")?.disabled).toBe(true);

        button("Check again")?.focus();
        button("Check again")?.click();
        await flushPromises();
        expect(text(dialog)).toContain("1 question, with text");
        expect(button("Publish")?.disabled).toBe(false);
        // Check again went away while checking
        expect(document.activeElement).toBe(button("Publish"));
    });

    it("once live, Share shows the link, Copy link, Open form and Unpublish", async () => {
        const wrapper = await mountOnPage(FormTopBar, { is_published: true });
        const crumbs = wrapper.get('nav[aria-label="Breadcrumb"]');

        expect(crumbs.text()).toContain("Live");
        expect(wrapper.findAll("button").map((b) => b.text())).not.toContain("Publish");

        await wrapper.findAll("button").find((b) => b.text() === "Share")?.trigger("click");

        const panel = wrapper.get('[aria-labelledby="share-title"]');
        expect(panel.get("h2").text()).toBe("Share your form");
        expect(panel.get("input").element.value).toBe(`${location.origin}/forms.show`);
        expect(panel.findAll("button").map((b) => b.text())).toEqual(
            expect.arrayContaining(["Copy link", "Unpublish…"]),
        );
        const open = panel.get("a");
        expect(text(open.element)).toBe("Open form ↗ (opens in a new tab)");
        expect(open.attributes("href")).toBe(`${location.origin}/forms.show`);
        expect(open.attributes("target")).toBe("_blank");
        expect(panel.text()).toContain("goes live at once");
    });

    it("keeps the focus on Copy link when the copy moves it away", async () => {
        // the copy without https focuses a hidden field, then drops it
        copy.mockImplementationOnce(() => (document.activeElement as HTMLElement).blur());
        const wrapper = await mountOnPage(FormTopBar, { is_published: true });

        await wrapper.findAll("button").find((b) => b.text() === "Share")?.trigger("click");
        const button = wrapper
            .get('[aria-labelledby="share-title"]')
            .findAll("button")
            .find((b) => b.text() === "Copy link");
        (button?.element as HTMLElement).focus();
        await button?.trigger("click");
        await flushPromises();

        expect(copy).toHaveBeenCalledWith(`${location.origin}/forms.show`);
        expect(document.activeElement).toBe(button?.element);
    });

    it("says so when Unpublish fails, and keeps the form live", async () => {
        const wrapper = await mountOnPage(FormTopBar, { is_published: true });
        vi.spyOn(window, "confirm").mockReturnValueOnce(true);
        vi.mocked(useForm().unpublishForm).mockRejectedValueOnce(new Error("offline"));

        await wrapper.findAll("button").find((b) => b.text() === "Share")?.trigger("click");
        const panel = wrapper.get('[aria-labelledby="share-title"]');
        const unpublish = panel.findAll("button").find((b) => b.text() === "Unpublish…");
        await unpublish?.trigger("click");
        await flushPromises();

        expect(panel.get('[role="alert"]').text()).toBe(
            "Couldn't unpublish the form. Try again.",
        );
        expect(unpublish?.attributes("disabled")).toBeUndefined();
        expect(wrapper.get('nav[aria-label="Breadcrumb"]').text()).toContain("Live");
    });

    it("moves the focus to Share after Publish, and to Publish after Unpublish", async () => {
        const wrapper = await mountOnPage(FormTopBar, {}, [block("q1", "<p>Your name?</p>")]);
        const store = useForm();
        const setLive = (is_published: boolean) => async () =>
            store.$patch({ form: { is_published } });
        vi.mocked(store.publishForm).mockImplementationOnce(setLive(true));
        vi.mocked(store.unpublishForm).mockImplementationOnce(setLive(false));
        vi.spyOn(window, "confirm").mockReturnValueOnce(true);

        await wrapper.findAll("button").find((b) => b.text() === "Publish")?.trigger("click");
        [...document.querySelectorAll('[role="dialog"] button')]
            .find((b) => text(b) === "Publish")
            ?.dispatchEvent(new MouseEvent("click"));
        await flushPromises();
        // the button you used is gone
        expect(text(document.activeElement)).toBe("Share");

        await wrapper.findAll("button").find((b) => b.text() === "Share")?.trigger("click");
        await wrapper
            .get('[aria-labelledby="share-title"]')
            .findAll("button")
            .find((b) => b.text() === "Unpublish…")
            ?.trigger("click");
        await flushPromises();
        expect(text(document.activeElement)).toBe("Publish");
    });

    it("gives every phone control 44 px and a name", async () => {
        const wrapper = await mountOnPage(FormTopBar);
        const back = wrapper.get('a[aria-label="All forms"].lg\\:hidden');
        const [formMenu, account] = wrapper.findAll('[aria-haspopup="menu"]');
        const publish = wrapper.findAll("button").find((b) => b.text() === "Publish");

        expect(back.classes()).toEqual(expect.arrayContaining(["h-11", "w-11"]));
        // the D9 menu button wraps the span that sets its size
        expect(formMenu.get("span").classes()).toContain("h-11");
        expect(account.get(".sr-only").text()).toBe("Account: Mara Jensen");
        expect(account.get('[aria-hidden="true"]').text()).toBe("MJ");
        expect(account.get("span").classes()).toEqual(
            expect.arrayContaining(["h-11", "w-11"]),
        );
        expect(publish?.classes()).toContain("h-11");
        // the pages move to the bottom bar on phones
        expect(wrapper.get('nav[aria-label="Form pages"]').classes()).toEqual(
            expect.arrayContaining(["hidden", "lg:flex"]),
        );
    });
});

describe("account menu", () => {
    it("names the account and shows initials when the user has no name yet", async () => {
        const wrapper = mount(AccountMenu, {
            props: {
                user: { name: null, email: "ole@example.org", current_team: { name: "Ole's" } },
            },
            global: { mocks: { $page, route } },
        });
        const button = wrapper.get('[aria-haspopup="menu"]');

        expect(button.get(".sr-only").text()).toBe("Account");
        expect(button.get('[aria-hidden="true"]').text()).toBe("O");
    });

    it("opens the account pages as page visits, like the old menu", async () => {
        const wrapper = mount(AccountMenu, {
            attachTo: document.body,
            props: { user: $page.props.auth.user },
            global: { mocks: { $page, route }, stubs: { Link: inertiaLink } },
        });

        await wrapper.get('[aria-haspopup="menu"]').trigger("click");
        await flushPromises();

        const visits = [...document.querySelectorAll('[role="menuitem"][data-inertia]')];
        expect(visits.map((item) => text(item))).toEqual([
            "Profile",
            "Manage team",
            "API tokens",
        ]);
    });
});

describe("bottom tab bar", () => {
    it("shows the 4 pages with icons and names under lg, and marks the current one", async () => {
        const wrapper = await mountOnPage(FormPageTabs, {}, []);
        await wrapper.setProps({ placement: "bottom" });
        const nav = wrapper.get('nav[aria-label="Form pages"]');
        const tabs = nav.findAll("a");

        expect(nav.classes()).toContain("lg:hidden");
        expect(tabs.map((tab) => tab.text())).toEqual([
            "Editor",
            "Settings",
            "Integrations",
            "Submissions",
        ]);
        expect(tabs.every((tab) => tab.classes().includes("h-16"))).toBe(true);
        expect(tabs[0].attributes("aria-current")).toBe("page");
        expect(tabs[1].attributes("aria-current")).toBeUndefined();
    });
});
