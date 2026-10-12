<template>
  <div class="flex shrink-0 items-center">
    <span
      aria-hidden="true"
      title="Drag to reorder"
      class="handle grid h-9 w-6 cursor-grab place-items-center text-grey-500 hover:text-grey-900"
    >
      <D9Icon name="grip-vertical" />
    </span>
    <button
      type="button"
      :aria-label="`Delete ${label}`"
      :title="`Delete ${label}`"
      class="grid h-9 w-9 place-items-center rounded-md text-grey-500 hover:bg-grey-100 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="$emit('onDelete')"
    >
      <D9Icon name="trash" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";

defineProps<{
  // names the delete button, e.g. 'choice "Yes"'
  label: string;
}>();

defineEmits<{
  (e: "onDelete"): void;
}>();
</script>
