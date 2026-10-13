<template>
  <div
    role="group"
    :aria-label="`Rule ${index + 1} of ${owner}`"
    class="my-1 space-y-3 rounded-lg border border-grey-200 bg-white p-3 text-[13px] text-grey-700 shadow-sm"
    @keydown.esc="onEscape"
  >
    <div v-for="(condition, i) in draft.conditions" :key="i" class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <span v-if="i === 0" class="shrink-0 font-medium sm:w-20">If</span>
        <div v-else class="w-20 shrink-0">
          <span :id="`${id}-${i}-chain-label`" class="sr-only"
            >And or or, condition {{ i + 1 }}</span
          >
          <D9Select
            :id="`${id}-${i}-chain`"
            size="small"
            :options="chains"
            :model-value="optionOf(chains, condition.chainOperator)"
            @update:model-value="
              (option) => (condition.chainOperator = option.id as 'and' | 'or')
            "
          />
        </div>

        <div
          class="min-w-0 flex-1 basis-48 rounded-md sm:flex-none"
          :class="isDeleted(condition.source) && 'ring-2 ring-red-500'"
        >
          <span :id="`${id}-${i}-source-label`" class="sr-only"
            >Question for condition {{ i + 1 }}</span
          >
          <D9Select
            :id="`${id}-${i}-source`"
            size="small"
            :options="sourceOptions"
            :model-value="optionOf(sourceOptions, condition.source)"
            :placeholder="
              isDeleted(condition.source)
                ? 'Deleted question'
                : 'Pick a question'
            "
            @update:model-value="
              (option) => setSource(condition, option.id as string)
            "
          />
        </div>

        <div class="w-32 shrink-0">
          <span :id="`${id}-${i}-operator-label`" class="sr-only"
            >Comparison for condition {{ i + 1 }}</span
          >
          <D9Select
            :id="`${id}-${i}-operator`"
            size="small"
            :options="operatorsFor(question(condition.source))"
            :model-value="
              optionOf(
                operatorsFor(question(condition.source)),
                condition.operator,
              )
            "
            @update:model-value="
              (option) => (condition.operator = option.id as Operator)
            "
          />
        </div>

        <div class="min-w-0 flex-1 basis-28">
          <template v-if="answerOptions(question(condition.source)).length">
            <span :id="`${id}-${i}-answer-label`" class="sr-only"
              >Answer for condition {{ i + 1 }}</span
            >
            <D9Select
              :id="`${id}-${i}-answer`"
              size="small"
              placeholder="Pick an answer"
              :options="answersOf(condition)"
              :model-value="optionOf(answersOf(condition), condition.value)"
              @update:model-value="
                (option) => (condition.value = String(option.id))
              "
            />
          </template>
          <template v-else>
            <label :for="`${id}-${i}-answer`" class="sr-only"
              >Answer for condition {{ i + 1 }}</label
            >
            <D9Input
              :id="`${id}-${i}-answer`"
              :type="fieldType(condition)"
              size="small"
              block
              placeholder="Answer"
              :aria-describedby="
                isText(condition) ? `${id}-${i}-hint` : undefined
              "
              :model-value="condition.value"
              @update:model-value="
                (value) => (condition.value = String(value ?? ''))
              "
            />
          </template>
        </div>

        <button
          v-if="draft.conditions.length > 1"
          type="button"
          :aria-label="`Remove condition ${i + 1}`"
          class="grid h-11 w-11 shrink-0 place-items-center rounded-md sm:h-8 sm:w-8 text-grey-600 hover:bg-grey-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="draft.conditions.splice(i, 1)"
        >
          <D9Icon name="trash" aria-hidden="true" />
        </button>
      </div>

      <p v-if="isDeleted(condition.source)" class="text-xs text-red-700">
        The question this rule used was deleted. Pick another one.
      </p>
      <p
        v-if="isText(condition)"
        :id="`${id}-${i}-hint`"
        class="text-xs text-grey-600"
      >
        Upper and lower case must match.
      </p>
    </div>

    <button
      type="button"
      class="flex h-11 items-center rounded-md px-2 font-semibold sm:h-8 text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="addCondition"
    >
      Add condition
    </button>

    <div class="flex flex-wrap items-center gap-2">
      <span class="shrink-0 font-medium sm:w-20">then</span>
      <div class="w-48 shrink-0">
        <span :id="`${id}-action-label`" class="sr-only">Action</span>
        <D9Select
          :id="`${id}-action`"
          size="small"
          :options="actions"
          :model-value="optionOf(actions, draft.action)"
          @update:model-value="
            (option) => (draft.action = option.id as FormBlockLogic['action'])
          "
        />
      </div>
      <div
        v-if="draft.action === 'goto'"
        class="min-w-0 flex-1 basis-60 rounded-md"
        :class="targetDeleted && 'ring-2 ring-red-500'"
      >
        <span :id="`${id}-target-label`" class="sr-only">Go to question</span>
        <D9Select
          :id="`${id}-target`"
          size="small"
          :options="targetOptions"
          :model-value="optionOf(targetOptions, draft.action_payload)"
          :placeholder="targetDeleted ? 'Deleted question' : 'Pick a question'"
          @update:model-value="
            (option) => (draft.action_payload = option.id as string)
          "
        />
      </div>
    </div>
    <p v-if="targetDeleted" class="text-xs text-red-700">
      The question this rule went to was deleted. Pick another one.
    </p>

    <ul
      v-if="errors.length"
      role="alert"
      class="space-y-1 text-xs text-red-700"
    >
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>

    <div
      class="flex flex-wrap items-center gap-2 border-t border-grey-200 pt-3"
    >
      <button
        v-if="rule.id !== undefined"
        type="button"
        class="flex h-11 items-center rounded-md px-2 font-semibold sm:h-8 text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="isAsking = true"
      >
        Remove rule
      </button>
      <span class="flex-1" />
      <D9Button label="Cancel" color="light" size="small" @click="cancel" />
      <D9Button
        label="Save rule"
        size="small"
        :is-loading="saving"
        :is-disabled="broken"
        :disabled="broken"
        @click="save"
      />
    </div>

    <DeleteDialog
      :show="isAsking"
      title="Remove this rule?"
      text="This can't be undone."
      confirm-label="Remove rule"
      @close="isAsking = false"
      @confirm="remove"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import truncate from "lodash/truncate";
import { D9Button, D9Icon, D9Input, D9Select } from "@deck9/ui";
import { useForm, useLogic } from "@/stores";
import { findAllBlocksBeforeTarget } from "@/stores/helpers/queue";
import DeleteDialog from "@/components/Factory/Shared/DeleteDialog.vue";
import { plainText } from "../questionSummary";
import { answerKind, answerOptions, operatorsFor } from "./ruleText";
import { editing, keepSaved, stopEditing } from "./ruleEditing";

const props = defineProps<{
  id: string;
  block: FormBlockModel;
  rule: FormBlockLogic;
  index: number;
  owner: string;
  numbers: Record<string, number>;
}>();
const emit = defineEmits<{ close: [] }>();

const store = useForm();
const logic = useLogic();

type Option = { id: string; label: string };

// edits a copy: Cancel leaves the rule as it was
const draft = reactive({
  ...props.rule,
  conditions: ((props.rule.conditions ?? []) as FormBlockLogicCondition[]).map(
    (condition) => ({ ...condition }),
  ),
});
const saving = ref(false);
const errors = ref<string[]>([]);

const isGroup = props.block.type === "group";
const chains: Option[] = [
  { id: "and", label: "And" },
  { id: "or", label: "Or" },
];
const actions: Option[] = [
  ...(isGroup ? [] : [{ id: "goto", label: "go to" }]),
  { id: "hide", label: `hide this ${isGroup ? "group" : "question"}` },
  { id: "show", label: `show this ${isGroup ? "group" : "question"}` },
];

const question = (uuid?: string | null) =>
  (store.blocks ?? []).find(
    (block) => block.uuid === uuid && block.type !== "group",
  );
const isDeleted = (uuid?: string | null) => !!uuid && !question(uuid);
const optionOf = <T extends { id: string }>(options: T[], id?: string | null) =>
  options.find((option) => option.id === id) ?? null;
const toOption = (block: FormBlockModel): Option => {
  const text = truncate(plainText(block.message), {
    length: 80,
    separator: " ",
  });

  return {
    id: block.uuid,
    label: `${props.numbers[block.uuid]} · ${text || "No question text yet"}`,
  };
};

// a jump can use the question's own answer; hide and show only earlier ones
const sourceOptions = computed(() =>
  findAllBlocksBeforeTarget(store.blocksTree, props.block.uuid, {
    includeTarget: draft.action === "goto",
  })
    .filter((block) => answerKind(block))
    .map(toOption),
);

// jumps go forward; an earlier target a rule already has stays
const targetOptions = computed(() =>
  (store.blocks ?? [])
    .filter(
      (block) =>
        block.type !== "group" &&
        (props.numbers[block.uuid] > props.numbers[props.block.uuid] ||
          block.uuid === draft.action_payload),
    )
    .sort((a, b) => props.numbers[a.uuid] - props.numbers[b.uuid])
    .map(toOption),
);

const targetDeleted = computed(
  () => draft.action === "goto" && isDeleted(draft.action_payload),
);
const broken = computed(
  () =>
    targetDeleted.value ||
    draft.conditions.some((condition) => isDeleted(condition.source)),
);

const answersOf = (condition: FormBlockLogicCondition): Option[] =>
  answerOptions(question(condition.source)).map((answer) => ({
    id: answer,
    label: answer,
  }));
const isText = (condition: FormBlockLogicCondition) =>
  answerKind(question(condition.source)) === "text";
const fieldType = (condition: FormBlockLogicCondition) =>
  ({ number: "number", date: "date" })[
    answerKind(question(condition.source)) as string
  ] ?? "text";

const setSource = (condition: FormBlockLogicCondition, uuid: string) => {
  condition.source = uuid;
  condition.operator = operatorsFor(question(uuid))[0].id;
  condition.value = "";
};

const addCondition = () => {
  draft.conditions.push({
    source: undefined,
    operator: "equals",
    value: "",
    chainOperator: "and",
  });
};

if (!draft.conditions.length) {
  addCondition();
}

const close = () => {
  emit("close");
};

const cancel = () => {
  stopEditing();
  close();
};

// Escape in an open list only closes the list
const onEscape = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;

  if (!event.defaultPrevented && !target.closest("[aria-expanded=true]")) {
    cancel();
  }
};

const save = async () => {
  if (broken.value || saving.value) {
    return;
  }

  saving.value = true;
  errors.value = [];
  // the store saves the rules of its block
  logic.block = props.block;

  try {
    const isGoto = draft.action === "goto";
    const rule: FormBlockLogic = {
      ...draft,
      evaluate: isGoto ? "after" : "before",
      action_payload: isGoto ? draft.action_payload : null,
    };
    const saved = await logic.saveSingleRule(rule);

    // a new rule comes back with its id; an update answers only true
    keepSaved(typeof saved === "object" ? saved : rule);
    close();
  } catch (error: any) {
    const data = error?.response?.status === 422 ? error.response.data : null;
    errors.value = data?.errors
      ? (Object.values(data.errors).flat() as string[])
      : ["The rule wasn't saved. Check your connection and try again."];
  } finally {
    saving.value = false;
  }
};

const isAsking = ref(false);

const remove = async () => {
  isAsking.value = false;
  logic.block = props.block;
  const count = props.block.logics?.length ?? 0;

  await logic.removeRule(props.index);

  // a failed delete keeps the rule and shows the save error
  if ((props.block.logics?.length ?? 0) < count) {
    editing.value = null;
    close();
  }
};

onMounted(() => document.getElementById(`${props.id}-0-source`)?.focus());
</script>
