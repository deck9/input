<template>
  <div class="flex flex-wrap items-center gap-x-1 py-0.5 pl-9">
    <p class="min-w-0 py-1 text-[13px] leading-6 text-grey-700">
      <template v-for="(part, i) in parts" :key="i">
        <DeletedQuestion v-if="part.deleted" />
        <template v-else-if="part.number"
          ><span class="sr-only">{{ "question " }}</span
          ><span class="tabular-nums">{{ part.number }}</span></template
        >
        <span
          v-else-if="part.value !== undefined"
          class="font-medium text-grey-900"
          >“{{ part.value }}”</span
        >
        <template v-else>{{ part.text }}</template>
      </template>
      <button
        v-if="target"
        type="button"
        :title="targetLabel"
        class="relative inline-flex h-6 max-w-full items-center rounded-md bg-blue-50 px-2 align-middle font-medium text-blue-700 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:max-w-[22rem] max-lg:before:absolute max-lg:before:inset-x-0 max-lg:before:-inset-y-2.5"
        @click="goToTarget"
      >
        <span class="truncate">{{ targetLabel }}</span>
      </button>
    </p>
    <button
      :id="`${id}-edit`"
      type="button"
      :aria-label="`Edit rule ${index + 1} of ${owner}`"
      class="flex h-11 shrink-0 items-center rounded-md px-2 text-[13px] lg:h-8 font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="emit('edit')"
    >
      Edit
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { plainText } from "../questionSummary";
import { focusBlock } from "../blockFocus";
import { operatorLabel } from "./ruleText";
import DeletedQuestion from "./DeletedQuestion.vue";

const props = defineProps<{
  id: string;
  block: FormBlockModel;
  rule: FormBlockLogic;
  index: number;
  // "question 4" or "group Feedback"
  owner: string;
  numbers: Record<string, number>;
}>();
const emit = defineEmits<{ edit: [] }>();

const store = useForm();
const workbench = useWorkbench();

type Part = {
  text?: string;
  value?: string;
  number?: number;
  deleted?: boolean;
};

const question = (uuid?: string | null) =>
  (store.blocks ?? []).find(
    (block) => block.uuid === uuid && block.type !== "group",
  );

const isGoto = computed(() => props.rule.action === "goto");
const target = computed(() =>
  isGoto.value ? question(props.rule.action_payload) : undefined,
);
const targetLabel = computed(() => {
  const block = target.value;
  return block
    ? `${props.numbers[block.uuid]} · ${plainText(block.message) || "No question text yet"}`
    : "";
});

const lead = { goto: "If ", hide: "Hidden if ", show: "Shown only if " };

const parts = computed(() => {
  const conditions = (props.rule.conditions ?? []) as FormBlockLogicCondition[];
  const [first] = conditions;
  // "If “No”, go to …" when a question jumps on its own answer
  const short =
    isGoto.value &&
    conditions.length === 1 &&
    first.source === props.block.uuid &&
    (first.operator === "equals" || first.operator === "contains");
  const parts: Part[] = [{ text: lead[props.rule.action] }];

  conditions.forEach((condition, i) => {
    if (i > 0) {
      parts.push({ text: condition.chainOperator === "or" ? " or " : " and " });
    }

    if (!short) {
      const source = question(condition.source);

      if (source) {
        parts.push({ number: props.numbers[source.uuid] });
      } else {
        parts.push(condition.source ? { deleted: true } : { text: "…" });
      }

      parts.push({ text: ` ${operatorLabel(condition.operator, source)} ` });
    }

    parts.push({ value: condition.value ?? "" });
  });

  if (!conditions.length) {
    parts.push({ text: "…" });
  }

  if (isGoto.value) {
    parts.push({ text: ", go to " });

    if (!target.value) {
      parts.push(props.rule.action_payload ? { deleted: true } : { text: "…" });
    }
  }

  return parts;
});

const goToTarget = () => {
  if (target.value) {
    workbench.putOnWorkbench(target.value);
    focusBlock(target.value);
  }
};
</script>
