<template>
  <!-- shows and hides the preview; on phones it's in the document, so the form name keeps its room -->
  <button
    type="button"
    :aria-pressed="open"
    class="hidden h-9 w-9 flex-none items-center justify-center gap-1.5 rounded-md border text-[13px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex xl:w-auto xl:px-2.5"
    :class="
      open
        ? 'border-white bg-white text-grey-900 hover:bg-grey-100'
        : 'border-grey-600 text-white hover:bg-grey-700'
    "
    @click="open = !open"
  >
    <D9Icon name="eye" /><span class="sr-only xl:not-sr-only">Preview</span>
  </button>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";

const open = defineModel<boolean>({ required: true });
</script>
