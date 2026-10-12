import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormListItem from "./FormListItem.vue";
import { callDuplicateForm } from "@/api/forms";

vi.mock("@/api/forms", () => ({ callDuplicateForm: vi.fn() }));

// renders every menu item without opening the menu
const stubs = {
    MenuContainer: { template: "<div><slot name='button' /><slot /></div>" },
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
        .find((button) => button.text() === "Duplicate Form")
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
    });
});

describe("form list row", () => {
    it("shows submissions with started and finished below, without the public URL", () => {
        const route = vi.fn((name: string) => `/${name}`);
        const form = {
            uuid: "form1",
            name: "Customer feedback",
            completed_sessions: 6,
            total_sessions: 7,
            completion_rate: 85.71,
        } as FormModel;
        const wrapper = mount(FormListItem, {
            props: { form },
            global: { stubs, mocks: { route } },
        });

        const link = wrapper.find('a[href="/forms.submissions"]');
        expect(link.text()).toBe("6 submissions");
        expect(wrapper.text()).toContain("7 started · 86% finished");
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
