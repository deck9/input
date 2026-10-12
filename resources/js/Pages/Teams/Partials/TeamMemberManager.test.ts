import { flushPromises, mount, VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TeamMemberManager from "./TeamMemberManager.vue";

const { visit } = vi.hoisted(() => ({ visit: vi.fn() }));

const page = { props: { auth: { user: { id: 1 } } } };

vi.mock("@inertiajs/vue3", async () => {
    const { reactive } = await import("vue");
    return {
        router: { delete: vi.fn() },
        usePage: () => page,
        useForm: (data: object) =>
            reactive({ ...data, errors: {}, processing: false, delete: visit }),
    };
});

const member = (id: number, name: string) => ({
    id,
    name,
    profile_photo_url: "",
    membership: { role: "editor" },
});

type Member = ReturnType<typeof member>;

let wrapper: VueWrapper | undefined;

const team = (users: Member[]) => ({ id: 1, users, team_invitations: [] });

const removeButtons = () =>
    wrapper!.findAll("button").filter((b) => b.text() === "Remove");

const focusedRow = () =>
    document.activeElement?.closest(".justify-between")?.textContent;

// opens the dialog from row i's Remove, confirms, and the page reloads without that row
const removeRow = async (users: Member[], i: number) => {
    const opener = removeButtons()[i].element as HTMLElement;
    opener.focus();
    opener.click();
    await flushPromises();
    [...document.querySelectorAll<HTMLElement>("[role=alertdialog] button")]
        .find((b) => b.textContent?.trim() === "Remove")
        ?.click();

    await wrapper!.setProps({ team: team(users.filter((_, j) => j !== i)) });
    visit.mock.calls[0][1].onSuccess();
    await flushPromises();
};

const mountWith = (users: Member[]) => {
    wrapper = mount(TeamMemberManager, {
        props: {
            team: team(users),
            availableRoles: [],
            userPermissions: {
                canAddTeamMembers: true,
                canRemoveTeamMembers: true,
                canUpdateTeamMembers: true,
            },
        },
        global: { mocks: { $page: page } },
        attachTo: document.body,
    });
};

beforeEach(() => {
    visit.mockClear();
    window.route = vi.fn(
        () => "/teams/1/members/2",
    ) as unknown as typeof window.route;
});

afterEach(() => {
    wrapper?.unmount();
});

describe("focus after removing a team member", () => {
    it("goes to the next row's Remove", async () => {
        const users = [member(2, "Ada"), member(3, "Bea")];
        mountWith(users);
        await removeRow(users, 0);

        expect(document.activeElement).toBe(removeButtons()[0].element);
        expect(focusedRow()).toContain("Bea");
    });

    it("goes to the Add Team Member heading when no member is left", async () => {
        const users = [member(2, "Ada")];
        mountWith(users);
        await removeRow(users, 0);

        expect(removeButtons()).toHaveLength(0);
        expect(document.activeElement?.tagName).toBe("H3");
        expect(document.activeElement?.textContent?.trim()).toBe(
            "Add Team Member",
        );
    });
});
