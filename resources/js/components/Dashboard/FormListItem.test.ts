import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormListItem from "./FormListItem.vue";
import {
    callDeleteForeverForm,
    callDeleteForm,
    callDuplicateForm,
    callPublishForm,
    callRestoreForm,
    callUnpublishForm,
} from "@/api/forms";

vi.mock("@/api/forms", () => ({
    callDeleteForeverForm: vi.fn(),
    callDeleteForm: vi.fn(),
    callDuplicateForm: vi.fn(),
    callPublishForm: vi.fn(),
    callRestoreForm: vi.fn(),
    callUnpublishForm: vi.fn(),
}));

const copy = vi.fn();
vi.mock("@vueuse/core", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useClipboard: () => ({ copy }),
}));

// renders every menu item without opening the menu
const stubs = {
    MenuContainer: {
        props: ["label"],
        template:
            "<div><button aria-haspopup='menu' :aria-label='label'><slot name='button' /></button><slot /></div>",
    },
    MenuLink: { props: ["label"], template: "<button>{{ label }}</button>" },
};

const route = vi.fn(() => "/forms");
let wrapper: VueWrapper | undefined;

// the dialog is teleported to the body
const dialog = () => document.querySelector<HTMLElement>("[role=dialog]");
const nameInput = () => dialog()?.querySelector("input") as HTMLInputElement;
const dialogButton = (label: string) =>
    dialog()?.querySelector(`button[aria-label="${label}"]`) as HTMLElement;

const openDuplicateDialog = async (form: FormModel) => {
    wrapper = mount(FormListItem, {
        props: { form },
        global: { stubs, mocks: { route } },
        attachTo: document.body,
    });

    await wrapper
        .findAll("button")
        .find((button) => button.text() === "Duplicate…")
        ?.trigger("click");
    await flushPromises();
};

describe("duplicate a form", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.route = route as unknown as typeof window.route;
        vi.mocked(callDuplicateForm).mockResolvedValue({
            data: { uuid: "copy1" },
        } as AxiosResponse);
    });

    afterEach(() => {
        wrapper?.unmount();
    });

    it("asks for the name with the copy's name prefilled and focused", async () => {
        await openDuplicateDialog({ uuid: "form1", name: "Contact" } as FormModel);

        expect(dialog()?.textContent).toContain("Duplicate form");
        expect(dialog()?.querySelector("label")?.textContent).toBe("Name");
        expect(nameInput().value).toBe("Contact (copy)");
        expect(document.activeElement).toBe(nameInput());
    });

    it("cuts the prefilled name to 255 characters", async () => {
        await openDuplicateDialog({
            uuid: "form1",
            name: "🎉".repeat(255),
        } as FormModel);

        expect(Array.from(nameInput().value)).toHaveLength(255);
    });

    it("duplicates the form with the name and opens the copy", async () => {
        const form = { uuid: "form1", name: "Contact" } as FormModel;
        await openDuplicateDialog(form);
        dialogButton("Duplicate").click();
        await flushPromises();

        expect(callDuplicateForm).toHaveBeenCalledWith(form, "Contact (copy)");
        expect(route).toHaveBeenLastCalledWith("forms.edit", { uuid: "copy1" });
    });

    it("says so in the dialog when the copy can't be created", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.mocked(callDuplicateForm).mockRejectedValue(new Error("Network Error"));

        await openDuplicateDialog({ uuid: "form1", name: "Contact" } as FormModel);
        dialogButton("Duplicate").click();
        await flushPromises();

        expect(dialog()?.querySelector("[role=alert]")?.textContent).toContain(
            "Couldn't create the form. Try again.",
        );
        expect(route).not.toHaveBeenCalledWith("forms.edit", { uuid: "copy1" });
    });

    it("creates no copy on Cancel", async () => {
        await openDuplicateDialog({ uuid: "form1", name: "Contact" } as FormModel);
        dialogButton("Cancel").click();
        await flushPromises();

        expect(dialog()).toBeNull();
        expect(callDuplicateForm).not.toHaveBeenCalled();
        // not the menu item it opened from, which is gone
        expect(document.activeElement).toBe(
            wrapper!.find("[aria-haspopup=menu]").element,
        );
    });
});

describe("form list row", () => {
    it("shows submissions with started and finished below, without the public URL", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Customer feedback",
            completed_sessions: 199,
            total_sessions: 200,
            completion_rate: 99.5,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        const link = wrapper.find('a[href="/forms.submissions"]');
        expect(link.text()).toBe("199 submissions");
        // rounded down, so a form that misses one never shows 100%
        expect(wrapper.text()).toContain("200 started · 99% finished");
        expect(wrapper.find('a[href="/forms.show"]').exists()).toBe(false);
    });

    it("writes large counts with the reader's thousands separator", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Newsletter",
            completed_sessions: 1031,
            total_sessions: 1200,
            completion_rate: 85.92,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        expect(wrapper.find('a[href="/forms.submissions"]').text()).toBe(
            `${(1031).toLocaleString()} submissions`,
        );
        expect(wrapper.text()).toContain(
            `${(1200).toLocaleString()} started`,
        );
    });

    it("says when a form has no submissions yet", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Contact",
            completed_sessions: 0,
            total_sessions: 3,
            completion_rate: 0,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        expect(wrapper.text()).toContain("No submissions yet");
        expect(wrapper.find('a[href="/forms.submissions"]').exists()).toBe(
            false,
        );
    });

    it("puts the full name in the title and lets the browser pick its direction", () => {
        const route = vi.fn(() => "/forms");
        const name = "استطلاع رضا العملاء";
        const wrapper = mount(FormListItem, {
            props: { form: { uuid: "form1", name } as FormModel },
            global: { stubs, mocks: { route } },
        });

        const link = wrapper.find(`[title="${name}"]`);
        expect(link.text()).toBe(name);
        expect(link.attributes("dir")).toBe("auto");
    });
});

describe("last submission", () => {
    const now = new Date(2026, 9, 12, 10, 0);
    const route = vi.fn(() => "/forms");
    const lastEdited: ListDate = {
        key: "updated_at",
        label: "Last edited",
        short: "Edited",
    };

    const mountRow = (form: Partial<FormModel>, date?: ListDate) =>
        mount(FormListItem, {
            props: {
                form: {
                    uuid: "form1",
                    name: "Contact",
                    completed_sessions: 4,
                    total_sessions: 5,
                    completion_rate: 80,
                    latest_submission_at: new Date(2026, 9, 9, 12, 0).toISOString(),
                    updated_at: new Date(2026, 8, 2, 9, 0).toISOString(),
                    ...form,
                } as FormModel,
                ...(date && { date }),
            },
            global: { stubs, mocks: { route } },
        });
    const dateCell = (wrapper: VueWrapper) => wrapper.get("div.tabular-nums[title]");
    const dots = (wrapper: VueWrapper) => wrapper.findAll(".bg-blue-600");

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(now);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("says when the form last got a submission, with the full date on hover", () => {
        const wrapper = mountRow({});

        expect(dateCell(wrapper).text()).toBe("Last submission: 3 days ago");
        expect(dateCell(wrapper).attributes("title")).toBe(
            new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(
                new Date(2026, 9, 9, 12, 0),
            ),
        );
        expect(dots(wrapper)).toHaveLength(0);
        // on phones never on the count's line
        expect(dateCell(wrapper).classes()).toContain("basis-full");
    });

    it("shows a dash, read as no submissions, also for a date without a count", () => {
        for (const form of [
            { completed_sessions: 0, latest_submission_at: null },
            { completed_sessions: 0 },
        ]) {
            const wrapper = mountRow(form);

            // the dash is hidden from screen readers, the words are hidden on screen
            expect(dateCell(wrapper).text()).toBe("Last submission: —No submissions");
            expect(dateCell(wrapper).attributes("title")).toBe("No submissions yet");
            expect(dots(wrapper)).toHaveLength(0);
        }
    });

    it("marks a submission in the last 24 hours with a dot screen readers read", () => {
        const wrapper = mountRow({
            latest_submission_at: new Date(2026, 9, 12, 9, 48).toISOString(),
        });

        expect(dateCell(wrapper).text()).toBe("Last submission: New, 12 min ago");
        expect(dateCell(wrapper).findAll(".bg-blue-600")).toHaveLength(1);
    });

    it("shows the date the list is sorted by, and moves the dot to the count", () => {
        const wrapper = mountRow(
            { latest_submission_at: new Date(2026, 9, 12, 9, 48).toISOString() },
            lastEdited,
        );

        expect(dateCell(wrapper).text()).toBe("Last edited: Edited 2 Sept");
        // phones see "Edited", screen readers hear only "Last edited"
        const short = dateCell(wrapper).get("[aria-hidden=true]");
        expect(short.text()).toBe("Edited");
        expect(short.classes()).toContain("lg:hidden");
        expect(dateCell(wrapper).find(".bg-blue-600").exists()).toBe(false);
        expect(dots(wrapper)).toHaveLength(1);
        expect(wrapper.text()).toContain("New, 4 submissions");
    });
});

describe("row actions", () => {
    const route = (name: string) => `/${name}`;
    const question = () => document.querySelector("[role=alertdialog]");
    const questionButton = (label: string) =>
        [...(question()?.querySelectorAll("button") ?? [])].find(
            (button) => button.textContent?.trim() === label ||
                button.getAttribute("aria-label") === label,
        ) as HTMLElement;
    const menuButton = () => wrapper!.find("[aria-haspopup=menu]");
    const menuItem = (label: string) =>
        wrapper!.findAll("button").find((button) => button.text() === label)!;
    const menuLabels = () =>
        wrapper!
            .findAll("button")
            .map((button) => button.text())
            .filter(Boolean);

    const mountRow = (form: Partial<FormModel> = {}) => {
        wrapper = mount(FormListItem, {
            props: {
                form: {
                    uuid: "form1",
                    name: "Contact",
                    is_published: true,
                    is_trashed: false,
                    completed_sessions: 0,
                    total_sessions: 0,
                    completion_rate: 0,
                    ...form,
                } as FormModel,
            },
            global: { stubs, mocks: { route } },
            attachTo: document.body,
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        window.route = route as unknown as typeof window.route;
    });

    afterEach(() => {
        wrapper?.unmount();
    });

    it("shows the status as a label and one menu named after the form", () => {
        mountRow();

        expect(menuButton().attributes("aria-label")).toBe(
            "Actions for Contact",
        );
        expect(menuButton().text()).not.toContain("Published");
        expect(wrapper!.text()).toContain("Published");
        expect(menuLabels()).toEqual([
            "Edit",
            "View submissions",
            "Copy link",
            "Open form",
            "Settings",
            "Duplicate…",
            "Unpublish",
            "Archive…",
        ]);
    });

    it("offers Copy link only on a published form", () => {
        mountRow({ is_published: false });

        expect(menuLabels()).not.toContain("Copy link");
        expect(menuLabels()).toContain("Publish");
    });

    it("offers only Restore and Delete permanently on an archived form, without links", () => {
        mountRow({ is_trashed: true, completed_sessions: 3 });

        expect(menuLabels()).toEqual(["Restore", "Delete permanently…"]);
        expect(wrapper!.find("a[title=Contact]").exists()).toBe(false);
        expect(wrapper!.text()).toContain("3 submissions");
        expect(wrapper!.find("a[href='/forms.submissions']").exists()).toBe(
            false,
        );
        expect(wrapper!.find("[aria-label^='Copy link']").exists()).toBe(false);
    });

    it("copies the public link in one click and announces it", async () => {
        mountRow();
        await wrapper!.find("[aria-label='Copy link to Contact']").trigger("click");
        await flushPromises();

        expect(copy).toHaveBeenCalledWith("/forms.show");
        expect(wrapper!.emitted("announce")).toEqual([[{ text: "Link copied" }]]);
    });

    it("keeps focus on the copy button when the copy moves it away", async () => {
        // the copy without https focuses a hidden field, then drops it
        copy.mockImplementationOnce(() =>
            (document.activeElement as HTMLElement).blur(),
        );
        mountRow();
        const button = wrapper!.find<HTMLElement>(
            "[aria-label='Copy link to Contact']",
        );
        button.element.focus();
        await button.trigger("click");
        await flushPromises();

        expect(document.activeElement).toBe(button.element);
    });

    it("publishes without asking and says the form is live, with Copy link", async () => {
        mountRow({ is_published: false });
        await menuItem("Publish").trigger("click");
        await flushPromises();

        expect(question()).toBeNull();
        expect(callPublishForm).toHaveBeenCalled();
        expect(wrapper!.text()).toContain("Published");
        expect(wrapper!.emitted("announce")).toEqual([
            [{ text: "Contact is live.", copy: expect.any(Function) }],
        ]);
    });

    it("focuses the menu after Copy link in the message, which goes away", async () => {
        mountRow({ is_published: false });
        await menuItem("Publish").trigger("click");
        await flushPromises();
        const [[announcement]] = wrapper!.emitted("announce") as [
            [{ copy: () => Promise<void> }],
        ];
        await announcement.copy();

        expect(copy).toHaveBeenCalledWith("/forms.show");
        expect(document.activeElement).toBe(menuButton().element);
    });

    it("unpublishes a form without submissions right away", async () => {
        mountRow();
        await menuItem("Unpublish").trigger("click");
        await flushPromises();

        expect(question()).toBeNull();
        expect(callUnpublishForm).toHaveBeenCalled();
        expect(wrapper!.text()).toContain("Unpublished");
    });

    it("asks before it unpublishes a form with submissions", async () => {
        mountRow({ completed_sessions: 40 });
        await menuItem("Unpublish…").trigger("click");
        await flushPromises();

        expect(question()?.textContent).toContain('Unpublish "Contact"?');
        expect(question()?.textContent).toContain("Your 40 submissions stay.");
        expect(callUnpublishForm).not.toHaveBeenCalled();
    });

    it("asks before it archives a published form, then shows it archived in place", async () => {
        mountRow();
        await menuItem("Archive…").trigger("click");
        await flushPromises();

        expect(question()?.textContent).toContain('Archive "Contact"?');
        expect(question()?.textContent).toContain(
            "It goes offline and moves to Archived. If you restore it, it comes back unpublished.",
        );
        // the red warning sign is only for delete
        expect(question()?.querySelector("svg")).toBeNull();
        expect(document.activeElement).toBe(questionButton("Cancel"));

        questionButton("Archive").click();
        await flushPromises();

        expect(callDeleteForm).toHaveBeenCalled();
        expect(question()).toBeNull();
        expect(wrapper!.text()).toContain("Archived");
        expect(menuLabels()).toEqual(["Restore", "Delete permanently…"]);
        expect(document.activeElement).toBe(menuButton().element);
    });

    it("shows a restored form as the server says, unpublished", async () => {
        vi.mocked(callRestoreForm).mockResolvedValue({
            data: { is_published: false },
        } as AxiosResponse);
        mountRow({ is_trashed: true, is_published: true });
        await menuItem("Restore").trigger("click");
        await flushPromises();

        expect(wrapper!.text()).toContain("Unpublished");
        expect(menuLabels()).toContain("Publish");
        expect(wrapper!.emitted("announce")).toEqual([
            [{ text: "Contact restored." }],
        ]);
    });

    it("tells the page the form's new status, so it can move it to its tab", async () => {
        mountRow({ is_published: false });
        await menuItem("Publish").trigger("click");
        await flushPromises();

        expect(wrapper!.emitted("changed")).toEqual([
            [expect.objectContaining({ uuid: "form1", is_published: true, is_trashed: false })],
        ]);
    });

    it("focuses the next row's menu when its form moves to another tab", async () => {
        const row = (uuid: string, name: string) =>
            ({ uuid, name, is_published: false, is_trashed: false, completed_sessions: 0 }) as FormModel;
        // a tab that only shows unpublished forms
        const Tab = {
            components: { FormListItem },
            data: () => ({ forms: [row("a", "Contact"), row("b", "Survey"), row("c", "Poll")] }),
            template: `<ul><FormListItem v-for="form in forms" :key="form.uuid" :form="form"
                @changed="(next) => (forms = forms.filter((form) => form.uuid !== next.uuid))" /></ul>`,
        };
        wrapper = mount(Tab, { global: { stubs, mocks: { route } }, attachTo: document.body });

        await menuItem("Publish").trigger("click");
        await flushPromises();

        expect(wrapper!.findAll("li")).toHaveLength(2);
        expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Survey");

        // the same after a question
        await menuItem("Archive…").trigger("click");
        await flushPromises();
        questionButton("Archive").click();
        await flushPromises();

        expect(wrapper!.findAll("li")).toHaveLength(1);
        expect(document.activeElement?.getAttribute("aria-label")).toBe("Actions for Poll");
    });

    it("archives nothing on Cancel and focuses the menu button again", async () => {
        mountRow();
        await menuItem("Archive…").trigger("click");
        await flushPromises();
        questionButton("Cancel").click();
        await flushPromises();

        expect(question()).toBeNull();
        expect(callDeleteForm).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(menuButton().element);
    });

    it("names the submissions before a permanent delete, in a danger button", async () => {
        mountRow({ is_trashed: true, completed_sessions: 1031 });
        await menuItem("Delete permanently…").trigger("click");
        await flushPromises();

        expect(question()?.textContent).toContain(
            `Delete "Contact" and its ${(1031).toLocaleString()} submissions?`,
        );
        expect(question()?.textContent).toContain("This can't be undone.");
        expect(questionButton("Delete permanently").className).toContain(
            "bg-red-600",
        );
        expect(question()?.querySelector("svg")).not.toBeNull();

        questionButton("Delete permanently").click();
        await flushPromises();

        expect(callDeleteForeverForm).toHaveBeenCalled();
        expect(wrapper!.find("li").exists()).toBe(false);
        // the page drops it, so it isn't counted any more
        expect(wrapper!.emitted("deleted")).toEqual([[expect.objectContaining({ uuid: "form1" })]]);
        expect(wrapper!.emitted("changed")).toBeUndefined();
    });

    it("focuses Create form after deleting the only row", async () => {
        const create = document.createElement("button");
        create.setAttribute("aria-label", "Create form");
        document.body.append(create);
        mountRow({ is_trashed: true });
        await menuItem("Delete permanently…").trigger("click");
        await flushPromises();
        questionButton("Delete permanently").click();
        await flushPromises();

        expect(document.activeElement).toBe(create);
        create.remove();
    });

    it("says so when an action fails and keeps the row as it was", async () => {
        vi.spyOn(console, "warn").mockImplementation(() => {});
        vi.mocked(callPublishForm).mockRejectedValue(new Error("Network Error"));
        mountRow({ is_published: false });
        await menuItem("Publish").trigger("click");
        await flushPromises();

        expect(wrapper!.text()).toContain("Unpublished");
        expect(wrapper!.emitted("announce")).toEqual([
            [{ text: "Couldn't publish the form. Try again." }],
        ]);
    });
});
