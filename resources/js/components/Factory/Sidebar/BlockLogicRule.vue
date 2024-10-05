<template>
  <div class="bg-grey-100 p-4 py-2 rounded">
    <div class="flex justify-between">
      <D9Label class="mb-3" :label="rule.name" />
      <D9Button
        size="small"
        icon="trash"
        @click="removeRule"
        color="danger"
        label="Delete Rule"
      />
    </div>

    <div class="font-mono text-sm tracking-widest text-blue-700 mb-2">
      <LabelToggle
        class="inline-block mr-1 uppercase"
        v-bind="{
          options: [
            { label: 'Before', value: 'before' },
            { label: 'After', value: 'after' },
          ],
        }"
        v-model="evaluate"
      />
      <span class="text-grey-700 tracking-normal mt-1">showing this block</span>
    </div>

    <div v-for="(condition, index) in conditions" :key="index" class="mb-2">
      <div
        class="flex justify-between font-mono uppercase text-xs tracking-widest text-grey-700"
      >
        <span v-if="index === 0">IF</span>
        <LabelToggle
          v-else
          v-bind="{
            options: [
              { label: 'AND', value: 'and' },
              { label: 'OR', value: 'or' },
            ],
          }"
          v-model="condition.chainOperator"
        />
        <button
          type="button"
          class="text-xsracking-normal text-red-500"
          @click="removeCondition(index)"
        >
          Remove
        </button>
      </div>

      <D9Select
        placeholder="Select a block"
        v-model="condition.source"
        size="small"
        :options="availableSourceBlocks"
      />

      <div class="flex items-center space-x-2 mt-1">
        <D9Select
          class="w-64"
          placeholder="Select an operator"
          v-model="condition.operator"
          size="small"
          :options="operators"
        />
        <D9Input
          class="w-full"
          v-model="condition.value"
          placeholer="Enter a value"
          size="small"
          block
        />
      </div>
    </div>

    <div class="mt-2">
      <button type="button" class="text-sm underline" @click="addCondition">
        <span v-if="hasConditions">Add another condition</span>
        <span v-else>Add condition</span>
      </button>
    </div>

    <div class="mt-3 font-mono text-sm">
      <span class="tracking-widest text-grey-700 mb-1">then</span>
      <LabelToggle
        class="text-sm inline-block mx-1 uppercase"
        v-bind="{
          options: [
            { label: 'Hide', value: 'hide' },
            { label: 'Show', value: 'show' },
            // { label: 'Go to', value: 'goto' },
          ],
        }"
        v-model="action"
      />
      <span v-if="action !== 'goto'" class="text-grey-700 tracking-normal mt-1"
        >this block</span
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Label, D9Input, D9Select, D9Button } from "@deck9/ui";
import { computed, Ref, ref, watch } from "vue";
import { useLogic, operators } from "@/stores";
import { getTextFromHtml } from "@/utils";
import LabelToggle from "@/components/Factory/Shared/LabelToggle.vue";

const logicStore = useLogic();

const props = defineProps<{
  rule: FormBlockLogic;
  index: number;
}>();

const evaluate = ref<FormBlockLogic["evaluate"]>(props.rule.evaluate);
const action = ref<FormBlockLogic["action"]>(props.rule.action);
const conditions: Ref<Array<EditableFormBlockBlockLogicCondition>> = ref([]);

const getBlockOption = (block: FormBlockModel) => {
  const text = getTextFromHtml(block.message ?? "");

  return {
    key: block.uuid,
    label: `<div class="inline-flex items-center text-xs"><span class="bg-grey-700 text-white rounded mr-2 px-1 py-px w-12 truncate inline-block text-center">${block.title ?? block.uuid}</span><span class="inline-block truncate">${text}</span></div>`,
  };
};

// if the loaded rule has already conditions, we should use those
if (props.rule.conditions) {
  const editableConditions = props.rule.conditions.map((condition) => {
    const operator = operators.find((op) => op.key === condition.operator);
    const source = logicStore.allBlocks?.find(
      (block) => block.uuid === condition.source,
    );

    return {
      ...condition,
      operator,
      source: source ? getBlockOption(source) : null,
    };
  });

  conditions.value = editableConditions;
}

const addCondition = () => {
  conditions.value.push({
    source: undefined,
    operator: operators[0],
    value: "",
    chainOperator: "and",
  });
};

const removeRule = () => {
  const result = window.confirm(
    "Are you sure you want to delete this rule? This action cannot be undone.",
  );

  if (!result) {
    return;
  }

  logicStore.removeRule(props.index);
};

const removeCondition = (index: number) => {
  conditions.value.splice(index, 1);
};

const hasConditions = computed(() => {
  return conditions.value.length > 0;
});

const availableSourceBlocks = computed(() => {
  return logicStore.availableSourceBlocks
    .filter((block) => block.type !== "group")
    .map((block) => {
      return getBlockOption(block);
    });
});

watch(
  [conditions, evaluate, action],
  () => {
    logicStore.updateBlockLogic(
      {
        ...props.rule,
        conditions: conditions.value,
        evaluate: evaluate.value,
        action: action.value,
      },
      props.index,
    );
  },
  { deep: true },
);
</script>
