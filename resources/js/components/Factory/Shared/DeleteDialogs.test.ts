import { flushPromises, mount } from "@vue/test-utils";
import { AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import DeleteDialog from "./DeleteDialog.vue";
import DeleteBlockDialog from "./DeleteBlockDialog.vue";
import DeleteChoiceDialog from "./DeleteChoiceDialog.vue";
import { checkDelete, useDeleteBlock } from "./useDeleteBlock";
import ClickInteraction from "@/components/Factory/Main/Interactions/ClickInteraction.vue";
import BlockLogicRule from "@/components/Factory/Sidebar/BlockLogicRule.vue";
import { callGetFormBlocks } from "@/api/blocks";
import { useForm, useLogic, useWorkbench } from "@/stores";

vi.mock("@/api/blocks", async (importOriginal) => ({
    ...(await importOriginal()),
    callGetFormBlocks: vi.fn(),
}));

const use = (id: number, block: string): FormBlockRuleUse => ({
    id,
    name: `Rule ${id}`,
    block,
    as: ["source"],
});

// the meetup form as the server sends it with includeSubmissions=true
const blocks = (): FormBlockModel[] =>
    [
        {
            id: 1,
            uuid: "q1",
            type: "radio",
            message: "<p>Will you come to the meetup?</p>",
            session_count: 40,
            used_by: [use(1, "q1"), use(2, "q3"), use(6, "g")],
        },
        {
            id: 2,
            uuid: "g",
            type: "group",
            title: "Food and drinks",
            used_by: [{ ...use(3, "q1"), as: ["target"] }],
        },
        {
            id: 3,
            uuid: "q2",
            type: "input-short",
            parent_block: "g",
            message: "<p>Any allergies?</p>",
            session_count: 0,
            used_by: [use(4, "q3"), use(5, "q2")],
        },
        {
            id: 4,
            uuid: "q3",
            type: "radio",
            message: "",
            session_count: 12,
            used_by: [],
            interactions: [
                { id: 10, label: "No", responses_count: 12 },
                { id: 11, label: "Yes", responses_count: 0 },
            ],
        },
    ] as unknown as FormBlockModel[];

const block = (uuid: string) =>
    useForm().blocks!.find((item) => item.uuid === uuid)!;

const stubs = { teleport: true };

describe("asking before a delete", () => {
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        vi.clearAllMocks();
        // real actions, not the stubs of the global testing pinia
        pinia = createPinia();
        setActivePinia(pinia);
        useForm().form = { uuid: "form1" } as FormModel;
        useForm().blocks = blocks();
        vi.mocked(callGetFormBlocks).mockResolvedValue({
            data: blocks(),
        } as AxiosResponse<FormBlockModel[]>);
    });

    describe("checkDelete", () => {
        it("counts a question's answers and the rules on other questions that use it", async () => {
            const check = await checkDelete(block("q1"));

            expect(callGetFormBlocks).toHaveBeenCalledWith("form1", true);
            expect(check.answers).toBe(40);
            expect(check.usedBy.map((rule) => rule.id)).toEqual([2, 6]);
        });

        it("counts a group's questions and the rules outside it that use the group or its questions", async () => {
            const check = await checkDelete(block("g"));

            expect(check.questions).toBe(1);
            expect(check.usedBy.map((rule) => rule.id)).toEqual([3, 4]);
        });

        it("counts the answers per choice", async () => {
            const check = await checkDelete(block("q3"));

            expect(check.choices).toEqual({ 10: 12, 11: 0 });
        });

        it("still names the rules when the counts can't load", async () => {
            vi.mocked(callGetFormBlocks).mockRejectedValue(
                new Error("offline"),
            );
            // the editor loads blocks without counts
            delete block("q1").session_count;

            const check = await checkDelete(block("q1"));

            expect(check.answers).toBeUndefined();
            expect(check.usedBy.map((rule) => rule.id)).toEqual([2, 6]);
        });
    });

    describe("DeleteBlockDialog", () => {
        const open = async (uuid: string) =>
            mount(DeleteBlockDialog, {
                props: {
                    block: block(uuid),
                    check: await checkDelete(block(uuid)),
                },
                global: { plugins: [pinia], stubs },
            });

        it("names the question, its answers and the questions whose rules stop working", async () => {
            const wrapper = await open("q1");

            expect(wrapper.find("[role=alertdialog]").text()).toContain(
                "Delete question?",
            );
            expect(wrapper.text()).toContain(
                "“Will you come to the meetup?” and its 40 answers will be deleted. This can't be undone.",
            );
            expect(wrapper.text()).toContain(
                "2 rules use this question and will stop working: question 3, group “Food and drinks”.",
            );
            expect(wrapper.find("button.bg-red-600").text()).toBe(
                "Delete question",
            );
        });

        it("leaves out answers a question doesn't have", async () => {
            const wrapper = await open("q2");

            expect(wrapper.text()).toContain(
                "“Any allergies?” will be deleted. This can't be undone.",
            );
            expect(wrapper.text()).toContain(
                "1 rule uses this question and will stop working: question 3.",
            );
        });

        it("leaves out rules when none use the question", () => {
            const wrapper = mount(DeleteBlockDialog, {
                props: {
                    block: block("q1"),
                    check: {
                        answers: 1,
                        questions: 0,
                        choices: {},
                        usedBy: [],
                    },
                },
                global: { plugins: [pinia], stubs },
            });

            expect(wrapper.text()).toContain(
                "“Will you come to the meetup?” and its 1 answer will be deleted.",
            );
            expect(wrapper.text()).not.toContain("rule");
        });

        it("says the answers go too when it can't count them", () => {
            const wrapper = mount(DeleteBlockDialog, {
                props: {
                    block: block("q1"),
                    check: { questions: 0, choices: {}, usedBy: [] },
                },
                global: { plugins: [pinia], stubs },
            });

            expect(wrapper.text()).toContain(
                "“Will you come to the meetup?” and its answers will be deleted. This can't be undone.",
            );
        });

        it("names a group and how many questions go with it", async () => {
            const wrapper = await open("g");

            expect(wrapper.text()).toContain("Delete group “Food and drinks”?");
            expect(wrapper.text()).toContain(
                "Its 1 question and its answers will be deleted too. This can't be undone.",
            );
            expect(wrapper.text()).toContain(
                "2 rules use this group and will stop working: question 1, question 3.",
            );
            expect(wrapper.find("button.bg-red-600").text()).toBe(
                "Delete group",
            );
        });

        it("emits confirm and close from its buttons", async () => {
            const wrapper = await open("q1");

            await wrapper.find("button.bg-red-600").trigger("click");
            await wrapper.findAll("button")[0].trigger("click");

            expect(wrapper.emitted("confirm")).toHaveLength(1);
            expect(wrapper.emitted("close")).toHaveLength(1);
        });
    });

    describe("useDeleteBlock", () => {
        it("deletes only after the owner confirms, and clears the workbench", async () => {
            const form = useForm();
            const workbench = useWorkbench();
            const remove = vi
                .spyOn(form, "deleteFormBlock")
                .mockResolvedValue();
            const clear = vi.spyOn(workbench, "clearWorkbench");
            workbench.block = block("q1");

            const deletion = mount(
                defineComponent({
                    setup: () => useDeleteBlock(block("q1")),
                    template: "<div />",
                }),
                { global: { plugins: [pinia] } },
            ).vm;

            await deletion.ask();
            expect(deletion.check?.answers).toBe(40);
            expect(remove).not.toHaveBeenCalled();

            deletion.confirm();
            expect(remove).toHaveBeenCalledWith(block("q1"));
            expect(clear).toHaveBeenCalled();
            expect(deletion.check).toBeNull();
        });
    });

    describe("deleting a choice", () => {
        const choice = (id: number, index: number) => {
            const workbench = useWorkbench();
            workbench.block = block("q3");
            const remove = vi
                .spyOn(workbench, "deleteInteraction")
                .mockResolvedValue();
            const wrapper = mount(ClickInteraction, {
                props: {
                    index,
                    item: block("q3").interactions!.find(
                        (item) => item.id === id,
                    )!,
                },
                global: { plugins: [pinia], stubs },
            });

            return { wrapper, remove };
        };

        const pressCmdBackspace = (wrapper: ReturnType<typeof mount>) =>
            wrapper
                .find("input[name=label]")
                .trigger("keydown", { key: "Backspace", metaKey: true });

        it("deletes a choice nobody picked at once", async () => {
            const { wrapper, remove } = choice(11, 1);

            await pressCmdBackspace(wrapper);
            await flushPromises();

            expect(remove).toHaveBeenCalledWith(
                expect.objectContaining({ id: 11 }),
            );
            expect(wrapper.find("[role=alertdialog]").exists()).toBe(false);
        });

        it("asks first when people picked the choice", async () => {
            const { wrapper, remove } = choice(10, 0);

            await pressCmdBackspace(wrapper);
            await flushPromises();

            expect(remove).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain("Delete “No”?");
            expect(wrapper.text()).toContain(
                "12 people picked it. Their answers to it will be deleted.",
            );

            await wrapper.find("button.bg-red-600").trigger("click");
            await flushPromises();

            expect(remove).toHaveBeenCalledWith(
                expect.objectContaining({ id: 10 }),
            );
        });

        it("says 1 person for a single answer", () => {
            const wrapper = mount(DeleteChoiceDialog, {
                props: { choice: { id: 10, label: "No" }, answers: 1 },
                global: { plugins: [pinia], stubs },
            });

            expect(wrapper.text()).toContain("1 person picked it.");
            expect(wrapper.find("button.bg-red-600").text()).toBe(
                "Delete choice",
            );
        });
    });

    describe("DeleteDialog", () => {
        it("closes only itself on Escape, not the logic panel under it", () => {
            const panel = vi.fn();
            window.addEventListener("keydown", panel);
            const wrapper = mount(DeleteDialog, {
                props: {
                    show: true,
                    title: "Delete?",
                    text: "",
                    confirmLabel: "Delete",
                },
                global: { stubs },
            });

            document.body.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
            );

            expect(wrapper.emitted("close")).toHaveLength(1);
            expect(panel).not.toHaveBeenCalled();
            window.removeEventListener("keydown", panel);
            wrapper.unmount();
        });
    });

    describe("deleting a rule", () => {
        it("asks in the app's dialog, not the browser's", async () => {
            const confirm = vi.spyOn(window, "confirm");
            const remove = vi
                .spyOn(useLogic(), "removeRule")
                .mockResolvedValue();
            const wrapper = mount(BlockLogicRule, {
                props: {
                    index: 2,
                    rule: {
                        name: "Skip",
                        evaluate: "after",
                        action: "goto",
                        action_payload: "q1",
                        conditions: [],
                    } as unknown as FormBlockLogic,
                },
                global: { plugins: [pinia], stubs },
            });

            await wrapper
                .find("button[aria-label='Delete rule']")
                .trigger("click");

            expect(confirm).not.toHaveBeenCalled();
            expect(wrapper.text()).toContain("Delete rule “Skip”?");
            expect(remove).not.toHaveBeenCalled();

            await wrapper.find("button.bg-red-600").trigger("click");

            expect(remove).toHaveBeenCalledWith(2);
        });
    });
});
