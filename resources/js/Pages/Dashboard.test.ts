import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
        props: ["forms"],
        template: "<ul><li v-for='form in forms'>{{ form.name }}</li></ul>",
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
        expect(callListForms).toHaveBeenCalledWith(null, "updated_at:desc");
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
            "updated_at:desc",
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
        wrapper!.findComponent(SortControl).vm.$emit("changeSort", "edited");
        await flushPromises();

        expect(window.history.pushState).not.toHaveBeenCalled();
        expect(callListForms).toHaveBeenCalledTimes(1);
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
        expect(callListForms).toHaveBeenLastCalledWith(null, "updated_at:desc");
    });
});
