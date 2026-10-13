<template>
  <!-- sits in the gap below a block; it shows on hover and keyboard focus, not on touch -->
  <div
    class="group/add absolute -bottom-1 left-8 right-0 z-10 flex h-4 items-center justify-center sm:left-12 [@media(hover:none)]:hidden"
  >
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 group-focus-within/add:opacity-100 group-hover/add:opacity-100"
    />
    <button
      type="button"
      class="relative flex h-6 items-center gap-1 rounded-full border border-blue-500 bg-blue-50 px-2.5 text-xs font-semibold text-blue-700 opacity-0 hover:bg-blue-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 group-hover/add:opacity-100"
      @click="openPicker({ key: `after-${after.uuid}`, after })"
    >
      <D9Icon name="plus" aria-hidden="true" class="h-3 w-3" />
      Add question here<span class="sr-only">, after {{ label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { openPicker } from "./addQuestion";

defineProps<{
  after: FormBlockModel;
  // names the block above: "question 3"
  label: string;
}>();
</script>
