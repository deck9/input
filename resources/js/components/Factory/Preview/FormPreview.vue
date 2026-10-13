<template>
  <!-- desktop: a phone-sized preview beside the document -->
  <aside
    v-if="open && isWide"
    aria-labelledby="preview-heading"
    class="flex w-[380px] flex-none flex-col items-center gap-3 overflow-y-auto border-l border-grey-200 bg-grey-100 py-4"
  >
    <h2 id="preview-heading" class="w-80 text-xs font-semibold text-grey-600">
      Preview
    </h2>
    <PreviewFrame />
  </aside>

  <!-- tablet and phone: over the document; closing it keeps it mounted, so focus goes back to Preview -->
  <Dialog :open="open && !isWide" class="relative z-40" @close="open = false">
    <div class="fixed inset-0 bg-grey-900/25" aria-hidden="true"></div>
    <DialogPanel
      class="fixed inset-y-0 right-0 flex w-full flex-col items-center gap-3 overflow-y-auto bg-grey-100 px-4 pb-4 pt-2 shadow-xl sm:w-[380px] sm:px-0"
    >
      <div class="flex w-80 max-w-full items-center justify-between">
        <DialogTitle class="text-xs font-semibold text-grey-600"
          >Preview</DialogTitle
        >
        <button
          type="button"
          class="-mr-3 flex h-11 w-11 items-center justify-center rounded-md text-grey-600 hover:bg-grey-200 hover:text-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="open = false"
        >
          <span class="sr-only">Close preview</span>
          <D9Icon name="close" aria-hidden="true" />
        </button>
      </div>
      <PreviewFrame />
    </DialogPanel>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { D9Icon } from "@deck9/ui";
import { useMediaQuery } from "@vueuse/core";
import { watch } from "vue";
import PreviewFrame from "./PreviewFrame.vue";

const open = defineModel<boolean>({ required: true });

const isWide = useMediaQuery("(min-width: 1280px)");
// a narrower window or a turned tablet must not pop the panel over the document
watch(isWide, (wide) => {
  if (!wide) open.value = false;
});
</script>
