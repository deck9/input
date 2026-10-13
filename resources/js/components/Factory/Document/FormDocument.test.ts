import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useWorkbench } from "@/stores";
import FormDocument from "./FormDocument.vue";
import { cursorFor } from "./blockFocus";
import { addAt } from "./addQuestion";
import { moveNote } from "./blockMove";

const blocks = [
    { id: 1, uuid: "b1", type: "none", message: "<p>Welcome</p>" },
    { id: 2, uuid: "b2", type: "none", message: "<p>Second</p>" },
] as FormBlockModel[];

const stubs = {
    DocumentList: {
        template: `<div>[list]<div id="row-b1" /><div id="row-b2" /></div>`,
    },
    RuleGutter: true,
    EndScreenBlock: { template: "<div>[end]</div>" },
};

let wrapper: VueWrapper | undefined;
const option = (name: string) =>
    wrapper!.findAll("[role=option]").find((item) => item.text() === name)!;
const scrolled = vi.fn();

describe("the form document", () => {
    beforeEach(() => {
        Element.prototype.scrollIntoView = function (
            this: Element,
            options?: boolean | ScrollIntoViewOptions,
        ) {
            scrolled(this.id, (options as ScrollIntoViewOptions)?.block);
        };
        scrolled.mockClear();
        useForm().$reset();
        useWorkbench().$reset();
        addAt.value = null;
        cursorFor.value = null;
    });

    afterEach(() => wrapper?.unmount());

    it("scrolls the question opened by link into view once it loads", async () => {
        wrapper = mount(FormDocument, {
            props: { status: "loading" },
            global: { stubs },
            attachTo: document.body,
        });

        useForm().blocks = blocks;
        useWorkbench().block = blocks[1];
        await wrapper.setProps({ status: "loaded" });
        await wrapper.vm.$nextTick();

        // the smallest scroll, so a question already in view stays put
        expect(scrolled).toHaveBeenCalledWith("row-b2", "nearest");
    });

    it("opens and scrolls to a question picked in the outline", async () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        await wrapper.findAll("nav li button")[1].trigger("click");
        await flushPromises();

        expect(useWorkbench().putOnWorkbench).toHaveBeenCalledWith(blocks[1]);
        expect(scrolled).toHaveBeenCalledWith("row-b2", "start");
    });

    it("shows the picker on an empty form and adds the first question", async () => {
        useForm().blocks = [];
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        expect(wrapper.text()).toContain("Add your first question");
        expect(wrapper.text()).not.toContain("0 questions");
        await option("Short text").trigger("click");

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            null,
            "input-short",
            null,
        );
    });

    it("adds a question at the end, also with one open, with the cursor in its text", async () => {
        const added = {
            id: 3,
            uuid: "b3",
            type: "input-email",
        } as FormBlockModel;
        useForm().blocks = blocks;
        useWorkbench().block = blocks[0];
        vi.mocked(useForm().createFormBlock).mockImplementation(async () => {
            useWorkbench().block = added;
        });
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        await wrapper
            .findAll("button")
            .find((button) => button.text() === "Add question")!
            .trigger("click");
        expect(wrapper.text()).toContain("Add a question at the end");
        await option("Email").trigger("click");
        await flushPromises();

        expect(useForm().createFormBlock).toHaveBeenCalledWith(
            null,
            "input-email",
            null,
        );
        expect(cursorFor.value).toBe("b3");
    });

    it("gives the cursor back to the end button after Esc, but not after a click elsewhere", async () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });
        const button = wrapper
            .findAll("button")
            .find((item) => item.text() === "Add question")!;
        const open = async () => {
            (button.element as HTMLElement).focus();
            await button.trigger("click");
        };

        // a click into the open question's text keeps the cursor there
        const text = document.createElement("textarea");
        document.body.append(text);
        await open();
        text.focus();
        text.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await flushPromises();
        expect(addAt.value).toBeNull();
        expect(document.activeElement).toBe(text);
        text.remove();

        await open();
        await wrapper.find("input").trigger("keydown", { key: "Escape" });
        expect(addAt.value).toBeNull();
        expect(document.activeElement).toBe(button.element);
    });

    it("puts Outline and the page's actions side by side, as 44 px icons below sm", () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            slots: { actions: "<button type='button'>Preview</button>" },
            global: { stubs },
        });

        const outline = wrapper
            .findAll("button")
            .find((button) => button.text() === "Outline");
        expect(outline?.classes()).toEqual(
            expect.arrayContaining(["h-11", "w-11", "sm:w-auto"]),
        );
        expect(outline?.get("span").classes()).toEqual(["sr-only", "sm:not-sr-only"]);
        expect(outline?.element.nextElementSibling?.textContent).toBe("Preview");
    });

    it("keeps the page's actions on an empty form, without Outline and the count", () => {
        useForm().blocks = [];
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            slots: { actions: "<button type='button'>Preview</button>" },
            global: { stubs },
        });

        const labels = wrapper.findAll("button").map((button) => button.text());
        expect(labels).toContain("Preview");
        expect(labels).not.toContain("Outline");
        expect(wrapper.text()).not.toContain("0 questions");
    });

    it("reads out where a moved question went", async () => {
        useForm().blocks = blocks;
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
            attachTo: document.body,
        });

        moveNote.value = "Moved to position 2 of 2";
        await wrapper.vm.$nextTick();

        expect(
            document.querySelector("[aria-live=polite]")?.textContent,
        ).toBe("Moved to position 2 of 2");
    });

    it.each([
        ["the questions", "[list]", blocks],
        ["no questions", "Add your first question", []],
    ])("shows the end screen after %s", (_, first, list) => {
        useForm().blocks = list as FormBlockModel[];
        wrapper = mount(FormDocument, {
            props: { status: "loaded" },
            global: { stubs },
        });
        const text = wrapper.text();

        expect(text.indexOf(first)).toBeGreaterThan(-1);
        expect(text.indexOf("[end]")).toBeGreaterThan(text.indexOf(first));
    });

    it("starts the end screen with a line, but not against a group's frame", () => {
        const group = { id: 3, uuid: "g1", type: "group" } as FormBlockModel;
        const inGroup = {
            id: 4,
            uuid: "b4",
            type: "none",
            parent_block: "g1",
        } as FormBlockModel;
        const line = (list: FormBlockModel[]) => {
            wrapper?.unmount();
            useForm().blocks = list;
            wrapper = mount(FormDocument, {
                props: { status: "loaded" },
                global: { stubs },
            });
            return wrapper
                .findAll("div")
                .find((item) => item.text() === "[end]")!
                .classes("border-t");
        };

        expect(line(blocks)).toBe(true);
        expect(line([...blocks, group, inGroup])).toBe(false);
        expect(line([])).toBe(false);
    });
});
