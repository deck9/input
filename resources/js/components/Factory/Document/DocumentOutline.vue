<template>
  <nav :aria-labelledby="`${id}-title`" class="px-2 py-3">
    <div class="flex h-8 items-center justify-between pl-2">
      <h2 :id="`${id}-title`" class="text-xs font-semibold text-grey-600">
        Outline
      </h2>
      <slot name="close" />
    </div>
    <ul class="mt-1 flex flex-col gap-px">
      <li v-for="item in items" :key="item.block.uuid">
        <div
          v-if="item.block.type === 'group'"
          class="mt-1.5 flex h-7 items-center gap-1.5 px-2 text-xs font-semibold text-grey-700"
        >
          <D9Icon name="layer-group" aria-hidden="true" />
          <span class="truncate">{{ item.block.title || "Group" }}</span>
        </div>
        <button
          v-else
          type="button"
          class="flex h-8 w-full items-center gap-2 rounded-md pr-2 text-left text-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :class="[
            item.inGroup ? 'pl-5' : 'pl-2',
            isCurrent(item.block)
              ? 'bg-blue-50 font-medium text-blue-700 hover:bg-blue-100'
              : 'text-grey-800 hover:bg-grey-100',
          ]"
          :aria-current="isCurrent(item.block) ? 'true' : undefined"
          @click="emit('pick', item.block)"
        >
          <span
            class="w-5 shrink-0 text-right tabular-nums"
            :class="isCurrent(item.block) ? 'text-blue-700' : 'text-grey-600'"
            >{{ numbers[item.block.uuid] }}</span
          >
          <span dir="auto" class="truncate">{{
            plainText(item.block.message) || "No question text yet"
          }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { D9Icon } from "@deck9/ui";
import { useForm, useWorkbench } from "@/stores";
import { plainText } from "./questionSummary";

defineProps<{
  numbers: Record<string, number>;
}>();
const emit = defineEmits<{ pick: [block: FormBlockModel] }>();

const store = useForm();
const workbench = useWorkbench();
const id = useId();

// the document's order: each group, then its questions
const items = computed(() => {
  const blocks = store.blocks ?? [];

  return blocks
    .filter((block) => !block.parent_block)
    .flatMap((block) => [
      { block, inGroup: false },
      ...(block.type === "group"
        ? blocks
            .filter((child) => child.parent_block === block.uuid)
            .map((child) => ({ block: child, inGroup: true }))
        : []),
    ]);
});

const isCurrent = (block: FormBlockModel) =>
  workbench.block?.uuid === block.uuid;
</script>
