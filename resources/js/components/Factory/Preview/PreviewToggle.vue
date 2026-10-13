<template>
  <!-- shows and hides the preview; its name shows from xl -->
  <button
    type="button"
    :aria-pressed="open"
    class="flex h-11 w-11 flex-none items-center justify-center gap-1.5 rounded-md border text-[13px] font-semibold text-white hover:bg-grey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:h-9 lg:w-9 xl:w-auto xl:px-2.5"
    :class="open ? 'border-grey-500 bg-grey-700' : 'border-grey-600'"
    @click="open = !open"
  >
    <D9Icon name="eye" /><span class="sr-only xl:not-sr-only">Preview</span>
  </button>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";

const open = defineModel<boolean>({ required: true });
</script>
