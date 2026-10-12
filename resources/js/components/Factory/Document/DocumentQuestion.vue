<template>
  <div :id="`row-${block.uuid}`" class="group/question flex scroll-mt-4 items-start">
    <div class="flex w-12 shrink-0 flex-col items-end gap-1 pr-2 pt-3">
      <span
        aria-hidden="true"
        class="flex h-6 items-center text-[13px] tabular-nums text-grey-600"
        >{{ number }}</span
      >
      <span
        aria-hidden="true"
        title="Drag to reorder"
        class="document-grip grid h-6 w-6 cursor-grab place-items-center rounded text-grey-500 hover:bg-grey-100 hover:text-grey-900 lg:opacity-0 lg:group-focus-within/question:opacity-100 lg:group-hover/question:opacity-100"
      >
        <D9Icon name="grip-vertical" />
      </span>
    </div>

    <QuestionCard v-if="isOpen" :block="block" :number="number" />
    <button
      v-else
      type="button"
      class="min-h-14 min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left hover:bg-grey-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="open"
    >
      <span class="flex items-start gap-2">
        <D9Icon
          :name="blockType?.icon ?? 'question'"
          aria-hidden="true"
          class="mt-1 h-4 w-4 shrink-0 text-grey-500"
        />
        <span
          dir="auto"
          class="line-clamp-2 break-words text-base"
          :class="
            text
              ? 'font-medium text-grey-900'
              : 'font-normal italic text-grey-600'
          "
          ><span class="sr-only">Question {{ number }}:&nbsp;</span
          >{{ text || "No question text yet" }}</span
        >
      </span>
      <span class="mt-1 flex flex-wrap gap-x-2 pl-6 text-xs text-grey-600">
        <span
          >{{ blockType?.label ?? block.type
          }}<template v-if="choiceCount !== null">
            · {{ choiceCount }} {{ choiceCount === 1 ? "choice" : "choices" }}
          </template></span
        >
        <span v-if="block.is_required" class="text-red-700">Required</span>
        <span v-if="ruleCount" class="tabular-nums"
          >{{ ruleCount }} {{ ruleCount === 1 ? "rule" : "rules" }}</span
        >
        <span v-if="block.is_disabled">Hidden</span>
        <span v-if="block.title" class="break-all font-mono">{{
          block.title
        }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Icon } from "@deck9/ui";
import { useWorkbench } from "@/stores";
import { useBlockTypes } from "@/components/Factory/utils/useBlockTypes";
import { plainText } from "./questionSummary";
import QuestionCard from "./QuestionCard.vue";
import { cursorFor } from "./blockFocus";

const props = defineProps<{
  block: FormBlockModel;
  number: number;
}>();

const workbench = useWorkbench();
const { types } = useBlockTypes();

const isOpen = computed(() => workbench.block?.id === props.block.id);

const text = computed(() => plainText(props.block.message));
const blockType = computed(() =>
  types.value.find((type) => type.value === props.block.type),
);
const choiceCount = computed(() =>
  ["radio", "checkbox"].includes(props.block.type)
    ? (props.block.interactions ?? []).filter(
        (item) => item.type === "button" && item.is_editable,
      ).length
    : null,
);
const ruleCount = computed(() => props.block.logics?.length ?? 0);

const open = () => {
  cursorFor.value = props.block.uuid;
  workbench.putOnWorkbench(props.block);
};
</script>
