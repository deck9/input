<template>
  <div
    class="grid w-24 grid-cols-4 rounded border border-grey-200 text-grey-800"
  >
    <button
      type="button"
      class="border-r border-grey-100 py-1 hover:bg-grey-100"
      @click="emit('prev')"
    >
      <D9Icon icon="chevron-left" />
    </button>
    <span class="col-span-2 inline-block whitespace-nowrap py-1 font-medium">
      <span>{{ currentPage }}</span>
      <span v-if="totalPages"> / {{ totalPages }}</span>
    </span>
    <button
      type="button"
      class="border-l border-grey-100 py-1 hover:bg-grey-100"
      @click="emit('next')"
    >
      <D9Icon icon="chevron-right" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";

defineProps<{
  currentPage: number;
  totalPages?: number;
}>();

const emit = defineEmits<{
  (e: "prev"): void;
  (e: "next"): void;
}>();
</script>
