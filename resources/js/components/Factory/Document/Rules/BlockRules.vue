<template>
  <ul v-if="block.logics?.length" :aria-label="`Rules of ${owner}`">
    <li
      v-for="(rule, index) in block.logics"
      :key="rule.uuid ?? `new-${index}`"
    >
      <RuleEditor
        v-if="isEditing(index)"
        v-bind="{ rule, index, owner, numbers, block }"
        :id="`${id}-${index}`"
        @close="returnTo(index)"
      />
      <RuleLine
        v-else
        v-bind="{ rule, index, owner, numbers, block }"
        :id="`${id}-${index}`"
        @edit="editRule(block, index)"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount } from "vue";
import RuleEditor from "./RuleEditor.vue";
import RuleLine from "./RuleLine.vue";
import { editing, editRule, returnFocus, stopEditing } from "./ruleEditing";

const props = defineProps<{
  block: FormBlockModel;
  numbers: Record<string, number>;
}>();

const id = computed(() => `rules-${props.block.uuid}`);
const owner = computed(() =>
  props.block.type === "group"
    ? `group ${props.block.title || "Group"}`
    : `question ${props.numbers[props.block.uuid]}`,
);

const isEditing = (index: number) =>
  editing.value?.block === props.block.uuid && editing.value.index === index;

// leaving the page ends editing: coming back shows the sentence again
onBeforeUnmount(() => {
  if (editing.value?.block === props.block.uuid) stopEditing();
});

// the cursor goes back to the rule's Edit, or where it was for a dropped rule
const returnTo = async (index: number) => {
  await nextTick();
  returnFocus(document.getElementById(`${id.value}-${index}-edit`));
};
</script>
