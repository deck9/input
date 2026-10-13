import { mount, VueWrapper } from "@vue/test-utils";
import { D9Select } from "@deck9/ui";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm, useLogic } from "@/stores";
import { questionNumbers } from "../questionSummary";
import BlockRules from "./BlockRules.vue";
import { addRule, editing } from "./ruleEditing";

const choices = (...labels: string[]) =>
    labels.map((label, sequence) => ({
        type: "button",
        is_editable: true,
        label,
        sequence,
    }));

const question = (
    uuid: string,
    type: string,
    text: string,
    extra: Partial<FormBlockModel> = {},
) =>
    ({
        id: uuid.length,
        uuid,
        type,
        message: `<p>${text}</p>`,
        parent_block: null,
        interactions: [],
        logics: [],
        ...extra,
    }) as unknown as FormBlockModel;

const rule = (
    action: FormBlockLogic["action"],
    conditions: Partial<FormBlockLogicCondition>[],
    target: string | null = null,
): FormBlockLogic => ({
    id: 1,
    uuid: "rule-1",
    form_block_id: 1,
    name: "Rule #1",
    action,
    action_payload: target,
    evaluate: action === "goto" ? "after" : "before",
    conditions: conditions.map((condition) => ({
        operator: "equals",
        value: "",
        chainOperator: "and",
        ...condition,
    })) as FormBlockLogicCondition[],
});

let blocks: FormBlockModel[];
const find = (uuid: string) =>
    useForm().blocks!.find((block) => block.uuid === uuid)!;

beforeEach(() => {
    blocks = [
        question("q-come", "radio", "Will you come?", {
            interactions: choices("Yes", "No, not this time") as never,
        }),
        question("q-days", "checkbox", "Which days?", {
            interactions: choices("Mon", "Tue") as never,
        }),
        question("q-rate", "rating", "How was it?"),
        question("q-date", "date", "When?"),
        question("q-num", "input-number", "How many?"),
        question("q-name", "input-short", "Your name?"),
        question("g-1", "group", "", { title: "Feedback" }),
        question("q-diff", "input-long", "What should we do differently?", {
            parent_block: "g-1",
        }),
    ];
    useForm().blocks = blocks;
    useLogic().$reset();
    editing.value = null;
});

const mountRules = (uuid: string) =>
    mount(BlockRules, {
        props: { block: find(uuid), numbers: questionNumbers(blocks) },
        attachTo: document.body,
    });

const text = (wrapper: VueWrapper) => wrapper.text().replace(/\s+/g, " ");

const select = (wrapper: VueWrapper, name: string) =>
    wrapper
        .findAllComponents(D9Select)
        .find((field) => String(field.props("id")).endsWith(name))!;

const optionLabels = (wrapper: VueWrapper, name: string) =>
    (select(wrapper, name).props("options") as { label: string }[]).map(
        (option) => option.label,
    );

const pick = async (wrapper: VueWrapper, name: string, label: string) => {
    const field = select(wrapper, name);
    const option = (field.props("options") as { label: string }[]).find(
        (item) => item.label === label,
    );
    field.vm.$emit("update:modelValue", option);
    await wrapper.vm.$nextTick();
};

const button = (wrapper: VueWrapper, label: string) =>
    wrapper.findAll("button").find((item) => item.text() === label)!;

describe("a rule under its question", () => {
    it("reads a jump on the question's own answer as a short sentence", () => {
        find("q-come").logics = [
            rule(
                "goto",
                [{ source: "q-come", value: "No, not this time" }],
                "q-diff",
            ),
        ];

        expect(text(mountRules("q-come"))).toContain(
            "If “No, not this time”, go to 7 · What should we do differently?",
        );
    });

    it("names another question by its number, never its id", () => {
        find("q-name").logics = [
            rule(
                "goto",
                [
                    { source: "q-come", operator: "equalsNot", value: "Yes" },
                    { source: "q-days", operator: "contains", value: "Mon" },
                ],
                "q-diff",
            ),
        ];

        const sentence = text(mountRules("q-name"));

        expect(sentence).toContain(
            "If question 1 is not “Yes” and question 2 includes “Mon”, go to 7 · What should",
        );
        expect(sentence).not.toContain("q-come");
    });

    it("says when a group is hidden", () => {
        find("g-1").logics = [
            rule("hide", [{ source: "q-come", value: "No, not this time" }]),
        ];

        expect(text(mountRules("g-1"))).toContain(
            "Hidden if question 1 is “No, not this time”",
        );
    });

    it("ignores an old target on a hide rule", () => {
        find("g-1").logics = [
            rule("show", [{ source: "q-come", value: "Yes" }], "q-name"),
        ];

        const sentence = text(mountRules("g-1"));

        expect(sentence).toContain("Shown only if question 1 is “Yes”");
        expect(sentence).not.toContain("go to");
    });

    it("shows a rule whose question was deleted in red", () => {
        find("q-name").logics = [
            rule("goto", [{ source: "gone", value: "Yes" }], "gone-too"),
        ];

        const wrapper = mountRules("q-name");
        const broken = wrapper.findAll(".text-red-700");

        expect(broken).toHaveLength(2);
        expect(broken[0].text()).toContain("Deleted question");
    });
});

describe("editing a rule in place", () => {
    beforeEach(() => {
        find("q-name").logics = [
            rule("goto", [{ source: "q-come", value: "Yes" }], "q-diff"),
        ];
    });

    const edit = async () => {
        const wrapper = mountRules("q-name");
        await button(wrapper, "Edit").trigger("click");
        return wrapper;
    };

    it("turns the sentence into pickers", async () => {
        const wrapper = await edit();

        expect(text(wrapper)).not.toContain("If question 1 is “Yes”");
        expect(optionLabels(wrapper, "-0-source")).toEqual([
            "1 · Will you come?",
            "2 · Which days?",
            "3 · How was it?",
            "4 · When?",
            "5 · How many?",
            "6 · Your name?",
        ]);
        expect(optionLabels(wrapper, "-target")).toEqual([
            "7 · What should we do differently?",
        ]);
    });

    it("offers the choices of a single choice question", async () => {
        const wrapper = await edit();

        expect(optionLabels(wrapper, "-0-operator")).toEqual(["is", "is not"]);
        expect(optionLabels(wrapper, "-0-answer")).toEqual([
            "Yes",
            "No, not this time",
        ]);
    });

    it("offers the range of a rating", async () => {
        const wrapper = await edit();
        await pick(wrapper, "-0-source", "3 · How was it?");

        expect(optionLabels(wrapper, "-0-operator")).toContain("is more than");
        expect(optionLabels(wrapper, "-0-answer")).toEqual([
            "1",
            "2",
            "3",
            "4",
            "5",
        ]);
    });

    it.each([
        ["4 · When?", "date"],
        ["5 · How many?", "number"],
    ])("gives %s a %s field", async (source, type) => {
        const wrapper = await edit();
        await pick(wrapper, "-0-source", source);

        expect(wrapper.find(`input[type=${type}]`).exists()).toBe(true);
    });

    it("keeps a text field for text, with a case hint", async () => {
        const wrapper = await edit();
        await pick(wrapper, "-0-source", "6 · Your name?");

        expect(optionLabels(wrapper, "-0-operator")).toHaveLength(6);
        expect(wrapper.find("input[type=text]").exists()).toBe(true);
        expect(text(wrapper)).toContain("Upper and lower case must match.");
    });

    it("can't save a rule whose question was deleted until it's fixed", async () => {
        find("q-name").logics = [
            rule("goto", [{ source: "gone", value: "Yes" }], "q-diff"),
        ];
        const wrapper = await edit();
        const save = () => button(wrapper, "Save rule");

        expect(text(wrapper)).toContain("Deleted question");
        expect(text(wrapper)).toContain(
            "The question this rule used was deleted. Pick another one.",
        );
        expect(save().attributes("disabled")).toBeDefined();

        await save().trigger("click");
        expect(useLogic().saveSingleRule).not.toHaveBeenCalled();

        await pick(wrapper, "-0-source", "1 · Will you come?");
        expect(save().attributes("disabled")).toBeUndefined();
    });

    it("saves the picked answer and shows the sentence again", async () => {
        const logic = useLogic();
        // an update answers only true
        vi.mocked(logic.saveSingleRule).mockResolvedValue(true as never);
        const wrapper = await edit();

        await pick(wrapper, "-0-answer", "No, not this time");
        await button(wrapper, "Save rule").trigger("click");
        await vi.waitFor(() => expect(editing.value).toBeNull());

        expect(logic.saveSingleRule).toHaveBeenCalledWith(
            expect.objectContaining({
                action: "goto",
                action_payload: "q-diff",
                evaluate: "after",
                conditions: [
                    expect.objectContaining({
                        source: "q-come",
                        operator: "equals",
                        value: "No, not this time",
                    }),
                ],
            }),
        );
        expect(text(wrapper)).toContain("If question 1 is “No, not this time”");
    });

    it("closes on Escape, but not when an open list takes it", async () => {
        const wrapper = await edit();
        const editor = wrapper.find("[role=group]");
        const listEscape = new KeyboardEvent("keydown", {
            key: "Escape",
            bubbles: true,
            cancelable: true,
        });
        listEscape.preventDefault();

        editor.element.dispatchEvent(listEscape);
        expect(editing.value).not.toBeNull();

        await editor.trigger("keydown", { key: "Escape" });
        expect(editing.value).toBeNull();
    });

    it("shows why the server refused a rule", async () => {
        vi.mocked(useLogic().saveSingleRule).mockRejectedValue({
            response: {
                status: 422,
                data: { errors: { action_payload: ["Pick a question."] } },
            },
        });
        const wrapper = await edit();

        await button(wrapper, "Save rule").trigger("click");

        await vi.waitFor(() =>
            expect(wrapper.find("[role=alert]").text()).toContain(
                "Pick a question.",
            ),
        );
        expect(editing.value).not.toBeNull();
    });
});

describe("adding a rule", () => {
    it("starts a jump on the question's own answer, and Cancel drops it", async () => {
        const owner = find("q-come");
        addRule(owner);
        const wrapper = mountRules("q-come");
        await wrapper.vm.$nextTick();

        expect(optionLabels(wrapper, "-0-source")).toEqual([
            "1 · Will you come?",
        ]);
        expect(select(wrapper, "-0-source").props("modelValue")).toMatchObject({
            id: "q-come",
        });

        await button(wrapper, "Cancel").trigger("click");
        expect(owner.logics).toHaveLength(0);
    });

    it("hides a group by default", () => {
        const group = find("g-1");
        addRule(group);

        expect(group.logics?.[0].action).toBe("hide");
    });
});
