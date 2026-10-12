import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ApiTokenManager from "./ApiTokenManager.vue";

const { visit } = vi.hoisted(() => ({ visit: vi.fn() }));

vi.mock("@inertiajs/vue3", async () => {
    const { reactive } = await import("vue");
    return {
        useForm: (data: object) =>
            reactive({ ...data, errors: {}, processing: false, delete: visit }),
    };
});

const tokens = [
    { id: 1, name: "One" },
    { id: 2, name: "Two" },
    { id: 3, name: "Three" },
];

let wrapper: VueWrapper | undefined;

const deleteButtons = () =>
    wrapper!.findAll("button").filter((b) => b.text() === "Delete");

const focusedRow = () =>
    document.activeElement?.closest(".justify-between")?.textContent;

// opens the dialog from row i's Delete, confirms, and the page reloads without that row
const deleteRow = async (list: typeof tokens, i: number) => {
    const opener = deleteButtons()[i].element as HTMLElement;
    opener.focus();
    opener.click();
    await flushPromises();
    [...document.querySelectorAll<HTMLElement>("[role=alertdialog] button")]
        .find((b) => b.textContent?.trim() === "Delete")
        ?.click();

    await wrapper!.setProps({ tokens: list.filter((_, j) => j !== i) });
    visit.mock.calls[0][1].onSuccess();
    await flushPromises();
};

const mountWith = (list: typeof tokens) => {
    wrapper = mount(ApiTokenManager, {
        props: {
            tokens: list,
            availablePermissions: [],
            defaultPermissions: [],
        },
        attachTo: document.body,
    });
};

beforeEach(() => {
    visit.mockClear();
    window.route = vi.fn(
        () => "/user/api-tokens/1",
    ) as unknown as typeof window.route;
});

afterEach(() => {
    wrapper?.unmount();
});

describe("focus after deleting a token", () => {
    it("goes to the next row's Delete", async () => {
        mountWith(tokens);
        await deleteRow(tokens, 1);

        expect(document.activeElement).toBe(deleteButtons()[1].element);
        expect(focusedRow()).toContain("Three");
    });

    it("goes to the previous row's Delete when the last row is gone", async () => {
        mountWith(tokens);
        await deleteRow(tokens, 2);

        expect(document.activeElement).toBe(deleteButtons()[1].element);
        expect(focusedRow()).toContain("Two");
    });

    it("goes to the Create API Token heading when no token is left", async () => {
        mountWith([tokens[0]]);
        await deleteRow([tokens[0]], 0);

        expect(deleteButtons()).toHaveLength(0);
        expect(document.activeElement?.tagName).toBe("H3");
        expect(document.activeElement?.textContent?.trim()).toBe(
            "Create API Token",
        );
    });
});
