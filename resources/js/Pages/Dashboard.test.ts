import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import Dashboard from "./Dashboard.vue";
import SortControl from "@/components/Dashboard/SortControl.vue";
import { callListForms } from "@/api/forms";

vi.mock("@/api/forms", () => ({ callListForms: vi.fn() }));

const forms = [
    { id: 1, name: "Müller Umfrage", is_published: true },
    { id: 2, name: "Contact", is_published: false },
    { id: 3, name: "Customer feedback", is_published: true },
] as FormModel[];
const archived = [{ id: 4, name: "Old contest", is_trashed: true }] as FormModel[];

const stubs = {
    AppLayout: { props: ["title"], template: "<main><slot /></main>" },
    CreateFormButton: true,
    FormListTable: {
        props: ["forms", "date"],
        template:
            "<div><ul v-if='forms.length'><li v-for='form in forms'>{{ form.name }}</li></ul><slot v-else /></div>",
    },
};

let wrapper: VueWrapper | undefined;

const mountAt = async (url: string) => {
    window.history.replaceState(null, "", url);
    wrapper = mount(Dashboard, { global: { stubs }, attachTo: document.body });
    await flushPromises();
    return wrapper;
};
const shown = () => wrapper!.findAll("li").map((li) => li.text());
const tab = (name: string) =>
    wrapper!
        .get("[role=group][aria-label=Status]")
        .findAll("button")
        .find((button) => button.text().startsWith(name))!;

describe("form list search, status and sort", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(callListForms).mockImplementation(
            async (filter) =>
                ({
                    data: filter === "trashed" ? archived : forms,
                }) as AxiosResponse<FormModel[]>,
        );
        vi.spyOn(window.history, "pushState");
        vi.spyOn(window.history, "replaceState");
    });

    afterEach(() => {
        wrapper?.unmount();
        vi.restoreAllMocks();
    });

    it("calls the page and the tab Forms", async () => {
        await mountAt("/");

        expect(wrapper!.get("h1").text()).toBe("Forms");
        expect(
            wrapper!.findComponent(stubs.AppLayout).props("title"),
        ).toBe("Forms");
    });

    it("filters by name as you type, ignoring case and accents", async () => {
        await mountAt("/");
        await wrapper!.get("input[type=search]").setValue("muller");

        expect(shown()).toEqual(["Müller Umfrage"]);
        // typing replaces the entry, so Back doesn't step through letters
        expect(window.history.replaceState).toHaveBeenLastCalledWith(
            null,
            "",
            "/?q=muller",
        );
        expect(window.history.pushState).not.toHaveBeenCalled();
    });

    it("counts the forms on the status tabs and leaves archived ones out of All", async () => {
        await mountAt("/");

        expect(tab("All").text()).toBe("All 3");
        expect(tab("Published").text()).toBe("Published 2");
        expect(tab("Unpublished").text()).toBe("Unpublished 1");
        expect(tab("Archived").text()).toBe("Archived");
        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
        expect(callListForms).toHaveBeenCalledTimes(1);
        expect(callListForms).toHaveBeenCalledWith(null, "latest_submission_at:desc");
    });

    it("moves a published or archived form to its tab and counts it there, without loading", async () => {
        await mountAt("/?status=unpublished");
        const list = wrapper!.findComponent(stubs.FormListTable);

        list.vm.$emit("changed", { ...forms[1], is_published: true });
        await nextTick();

        expect(shown()).toEqual([]);
        expect(tab("Published").text()).toBe("Published 3");
        expect(tab("Unpublished").text()).toBe("Unpublished 0");

        await tab("Published").trigger("click");
        list.vm.$emit("changed", { ...forms[0], is_trashed: true });
        await nextTick();

        expect(shown()).toEqual(["Contact", "Customer feedback"]);
        expect(tab("All").text()).toBe("All 2");
        expect(tab("Published").text()).toBe("Published 2");
        expect(callListForms).toHaveBeenCalledTimes(1);
    });

    it("moves a restored form out of Archived and loads the list for its place", async () => {
        await mountAt("/?status=archived");
        const list = wrapper!.findComponent(stubs.FormListTable);

        list.vm.$emit("changed", {
            ...archived[0],
            is_trashed: false,
            is_published: false,
        });
        await nextTick();

        expect(shown()).toEqual([]);
        expect(tab("All").text()).toBe("All 4");
        expect(tab("Unpublished").text()).toBe("Unpublished 2");
        // the first load asked twice, the reload asks again
        expect(callListForms).toHaveBeenCalledTimes(4);
        expect(callListForms).toHaveBeenNthCalledWith(3, null, "latest_submission_at:desc");
    });

    it("drops a deleted form, so the last archived one leaves an empty Archived tab", async () => {
        await mountAt("/?status=archived");

        wrapper!.findComponent(stubs.FormListTable).vm.$emit("deleted", archived[0]);
        await nextTick();

        expect(shown()).toEqual([]);
        expect(wrapper!.text()).toContain("No archived forms.");
        expect(wrapper!.text()).toContain("Show all forms");
    });

    it("shows a status in a new history entry, and loads archived forms only when chosen", async () => {
        await mountAt("/");
        await tab("Published").trigger("click");

        expect(shown()).toEqual(["Müller Umfrage", "Customer feedback"]);
        expect(window.history.pushState).toHaveBeenLastCalledWith(
            null,
            "",
            "/?status=published",
        );

        await tab("Archived").trigger("click");
        await flushPromises();

        expect(callListForms).toHaveBeenLastCalledWith(
            "trashed",
            "latest_submission_at:desc",
        );
        expect(shown()).toEqual(["Old contest"]);
    });

    it("puts the new url into Inertia's history state, so a reload on Back keeps it", async () => {
        await mountAt("/");
        window.history.replaceState({ component: "Dashboard", url: "/" }, "", "/");
        await tab("Published").trigger("click");

        expect(window.history.pushState).toHaveBeenLastCalledWith(
            { component: "Dashboard", url: "/?status=published" },
            "",
            "/?status=published",
        );
    });

    it("adds no history entry when the status or sort doesn't change", async () => {
        await mountAt("/");
        await tab("All").trigger("click");
        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "latest");
        await flushPromises();

        expect(window.history.pushState).not.toHaveBeenCalled();
        expect(callListForms).toHaveBeenCalledTimes(1);
    });

    it("sorts by latest submission by default, and the date column follows the sort", async () => {
        await mountAt("/");
        const list = wrapper!.findComponent(stubs.FormListTable);

        expect(callListForms).toHaveBeenCalledWith(null, "latest_submission_at:desc");
        expect(list.props("date")).toEqual({ key: "latest_submission_at", label: "Last submission" });

        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "edited");
        await flushPromises();
        expect(window.history.pushState).toHaveBeenLastCalledWith(null, "", "/?sort=edited");
        expect(list.props("date")).toEqual({ key: "updated_at", label: "Last edited", short: "Edited" });

        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "newest");
        await flushPromises();
        expect(list.props("date")).toEqual({ key: "created_at", label: "Created", short: "Created" });
    });

    it("sorts on the server and keeps the sort in a new history entry", async () => {
        await mountAt("/");
        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "name");
        await flushPromises();

        expect(callListForms).toHaveBeenLastCalledWith(null, "name:asc");
        expect(window.history.pushState).toHaveBeenLastCalledWith(
            null,
            "",
            "/?sort=name",
        );
    });

    it("starts from the URL and falls back to the defaults for unknown values", async () => {
        await mountAt("/?q=cust&status=published&sort=newest");

        expect(
            (wrapper!.get("input[type=search]").element as HTMLInputElement)
                .value,
        ).toBe("cust");
        expect(tab("Published").attributes("aria-pressed")).toBe("true");
        expect(callListForms).toHaveBeenCalledWith(null, "created_at:desc");
        expect(shown()).toEqual(["Customer feedback"]);
        wrapper!.unmount();

        await mountAt("/?status=bogus&sort=nope");

        expect(tab("All").attributes("aria-pressed")).toBe("true");
        expect(callListForms).toHaveBeenLastCalledWith(null, "latest_submission_at:desc");
    });
});

describe("form list states", () => {
    const answer = (data: FormModel[]) =>
        ({ data }) as AxiosResponse<FormModel[]>;
    const list = () => wrapper!.findComponent(stubs.FormListTable);
    const button = (label: string) =>
        wrapper!.findAll("button").find((button) => button.text() === label)!;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(callListForms).mockImplementation(async (filter) =>
            answer(filter === "trashed" ? archived : forms),
        );
    });

    afterEach(() => {
        wrapper?.unmount();
        vi.useRealTimers();
    });

    it("shows skeleton rows on the first load, never the first-run text", async () => {
        vi.mocked(callListForms).mockReturnValue(new Promise(() => {}));
        await mountAt("/");

        expect(list().attributes("aria-busy")).toBe("true");
        expect(list().text()).toBe("Loading forms");
        expect(wrapper!.text()).not.toContain("Create your first form");
        expect(wrapper!.text()).not.toContain("No forms");
        // no counts until the forms are there
        expect(tab("All").text()).toBe("All");
    });

    it("keeps the current list, faded, while a new sort loads", async () => {
        await mountAt("/");
        vi.mocked(callListForms).mockReturnValue(new Promise(() => {}));
        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "name");
        await flushPromises();

        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
        expect(list().attributes("aria-busy")).toBe("true");
        expect(list().classes()).toContain("opacity-60");
    });

    it("still loads all forms when Archived is picked during the first load", async () => {
        vi.mocked(callListForms).mockReturnValueOnce(new Promise(() => {}));
        await mountAt("/");
        await tab("Archived").trigger("click");
        await flushPromises();
        await tab("All").trigger("click");

        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
    });

    it("says when the list failed and loads it again on Try again", async () => {
        vi.mocked(callListForms).mockRejectedValueOnce(new Error("offline"));
        vi.spyOn(console, "warn").mockImplementation(() => {});
        await mountAt("/");

        expect(wrapper!.get("[role=alert]").text()).toContain(
            "Couldn't load your forms.",
        );
        expect(shown()).toEqual([]);

        await button("Try again").trigger("click");
        await flushPromises();

        expect(wrapper!.find("[role=alert]").exists()).toBe(false);
        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
        expect(document.activeElement).toBe(
            wrapper!.get("input[type=search]").element,
        );
    });

    it("says when a search finds nothing and clears it", async () => {
        await mountAt("/?status=published");
        const search = wrapper!.get("input[type=search]");
        await search.setValue("müllr");

        expect(list().text()).toContain('No published forms match "müllr".');

        await button("Clear search").trigger("click");

        expect((search.element as HTMLInputElement).value).toBe("");
        expect(document.activeElement).toBe(search.element);
        expect(shown()).toEqual(["Müller Umfrage", "Customer feedback"]);
    });

    it("says when a status has no forms and shows all of them", async () => {
        vi.mocked(callListForms).mockImplementation(async (filter) =>
            answer(filter === "trashed" ? [] : forms),
        );
        await mountAt("/?status=archived");

        expect(list().text()).toContain("No archived forms.");

        await button("Show all forms").trigger("click");

        expect(tab("All").attributes("aria-pressed")).toBe("true");
        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
    });

    it("reads out how many forms the search finds, after a pause in typing", async () => {
        await mountAt("/");
        vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
        const live = wrapper!.get("p[role=status]");
        const type = async (text: string) => {
            await wrapper!.get("input[type=search]").setValue(text);
            vi.advanceTimersByTime(500);
            await nextTick();
        };
        expect(live.text()).toBe("");

        await wrapper!.get("input[type=search]").setValue("cu");
        expect(live.text()).toBe("");

        await type("cust");
        expect(live.text()).toBe("1 form");

        await type("c");
        expect(live.text()).toBe("2 forms");

        await type("zzz");
        expect(live.text()).toBe('No forms match "zzz".');

        await type("");
        expect(live.text()).toBe("");
    });

    it("shows the latest sort when an older answer comes last", async () => {
        await mountAt("/");
        const answers: Array<(value: AxiosResponse<FormModel[]>) => void> = [];
        vi.mocked(callListForms).mockImplementation(
            () => new Promise((resolve) => answers.push(resolve)),
        );
        const sortControl = wrapper!.findComponent(SortControl);
        sortControl.vm.$emit("changeSort", "name");
        sortControl.vm.$emit("changeSort", "newest");

        answers[1](answer([forms[2]]));
        await flushPromises();
        answers[0](answer([forms[0]]));
        await flushPromises();

        expect(shown()).toEqual(["Customer feedback"]);
        expect(list().attributes("aria-busy")).toBe("false");
    });

    it("shows the error, not the first-run card, when only the archived forms fail", async () => {
        vi.mocked(callListForms).mockImplementation(async (filter) => {
            if (filter === "trashed") throw new Error("offline");
            return answer(forms);
        });
        vi.spyOn(console, "warn").mockImplementation(() => {});
        await mountAt("/?status=archived");

        expect(wrapper!.get("[role=alert]").text()).toContain(
            "Couldn't load your forms.",
        );
        expect(wrapper!.text()).not.toContain("Create your first form");
    });

    it("keeps the error to the archived forms when only they fail", async () => {
        await mountAt("/");
        vi.mocked(callListForms).mockRejectedValue(new Error("offline"));
        vi.spyOn(console, "warn").mockImplementation(() => {});
        await tab("Archived").trigger("click");
        await flushPromises();

        expect(wrapper!.find("[role=alert]").exists()).toBe(true);

        await tab("All").trigger("click");

        expect(wrapper!.find("[role=alert]").exists()).toBe(false);
        expect(shown()).toEqual(["Müller Umfrage", "Contact", "Customer feedback"]);
    });

    it("shows the first-run card only when the team has no forms at all", async () => {
        vi.mocked(callListForms).mockResolvedValue(answer([]));
        await mountAt("/");

        expect(wrapper!.get("h2").text()).toBe("Create your first form");
        expect(wrapper!.text()).toContain(
            "Build a form, share its link and read the answers here.",
        );
        expect(wrapper!.find("input[type=search]").exists()).toBe(false);
        expect(callListForms).toHaveBeenCalledWith("trashed", "latest_submission_at:desc");
        wrapper!.unmount();

        // archived forms only: no first run, a way to them instead
        vi.mocked(callListForms).mockImplementation(async (filter) =>
            answer(filter === "trashed" ? archived : []),
        );
        await mountAt("/");

        expect(wrapper!.text()).not.toContain("Create your first form");
        expect(list().text()).toContain("All your forms are archived.");

        await button("Show archived forms").trigger("click");

        expect(tab("Archived").attributes("aria-pressed")).toBe("true");
        expect(shown()).toEqual(["Old contest"]);
    });
});
