<template>
  <div>
    <D9Label
      label="Hide Block"
      description="Hide this block based on one or more conditions"
    />

    <template v-if="availableSourceBlocks.length > 0">
      <div v-for="(condition, index) in conditions" :key="index" class="mt-2">
        <div
          class="flex justify-between font-mono uppercase text-xs tracking-widest text-blue-700"
        >
          <span
            v-if="index === 0"
            class="font-mono uppercase text-xs tracking-widest text-blue-700"
            >When</span
          >
          <div
            class="font-mono uppercase text-xs tracking-widest text-blue-700"
            v-else
          >
            <input
              v-model="condition.chainOperator"
              :id="'chain-operator-and-' + index"
              type="radio"
              class="uppercase appearance-none peer/and hidden"
              :name="'chain-operator-' + index"
              value="and"
            />
            <label
              class="cursor-pointer text-grey-300 peer-checked/and:text-blue-700 peer-checked/and:font-bold"
              :for="'chain-operator-and-' + index"
              >AND</label
            >
            <span>/</span>
            <input
              v-model="condition.chainOperator"
              :id="'chain-operator-or-' + index"
              type="radio"
              class="uppercase appearance-none hidden peer/or"
              :name="'chain-operator-' + index"
              value="or"
            />
            <label
              class="cursor-pointer text-grey-300 peer-checked/or:text-blue-700 peer-checked/or:font-bold"
              :for="'chain-operator-or-' + index"
              >OR</label
            >
          </div>
          <button
            type="button"
            class="text-xs font-mono tracking-normal text-red-500"
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

      <div class="mt-1">
        <button
          v-if="hasConditions"
          type="button"
          class="text-sm underline"
          @click="addCondition"
        >
          Add another condition
        </button>
        <D9Button
          v-else
          label="Add condition"
          color="dark"
          size="small"
          @click="addCondition"
        />
      </div>

      <pre class="text-xxs bg-black text-white p-2 rounded mt-4">{{
        conditions
      }}</pre>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { D9Label, D9Input, D9Select, D9Button } from "@deck9/ui";
import { computed, Ref, ref, watch } from "vue";
import { useLogic } from "@/stores";
import { getTextFromHtml } from "@/utils";

const logicStore = useLogic();

const operators: Array<{ key: Operator; label: string }> = [
  { key: "equals", label: "is equal to" },
  { key: "equalsNot", label: "is not equal to" },
  { key: "contains", label: "contains" },
  { key: "containsNot", label: "does not contain" },
  { key: "isLowerThan", label: "is lower than" },
  { key: "isGreaterThan", label: "is greater than" },
];

const conditions: Ref<Array<EditableFormBlockBlockLogicCondition>> = ref([]);

const addCondition = () => {
  conditions.value.push({
    source: undefined,
    operator: operators[0],
    value: "",
    chainOperator: "and",
  });
};

const removeCondition = (index: number) => {
  conditions.value.splice(index, 1);
};

const hasConditions = computed(() => {
  return conditions.value.length > 0; // TODO: check if all conditions are valid
});

const availableSourceBlocks = computed(() => {
  return logicStore.availableSourceBlocks
    .filter((block) => block.type !== "group")
    .map((block) => {
      const text = getTextFromHtml(block.message ?? "");

      return {
        key: block.uuid,
        label: `<span class="bg-grey-900 text-white rounded mr-2 px-1 py-px">${block.title ?? block.uuid}</span><span class="truncate">${text}</span>`,
      };
    });
});

watch(
  conditions,
  () => {
    logicStore.updateHideRule(conditions.value);
  },
  { deep: true },
);
</script>
