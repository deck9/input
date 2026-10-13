<template>
  <!-- desktop: a phone-sized preview beside the document -->
  <aside
    v-if="open && isWide"
    aria-labelledby="preview-heading"
    class="flex w-[380px] flex-none flex-col items-center gap-3 overflow-y-auto border-l border-grey-200 bg-grey-100 py-4"
  >
    <h2 id="preview-heading" class="w-80 text-xs font-semibold text-grey-600">
      {{ heading }}
    </h2>
    <p v-if="hidden" class="w-80 max-w-full text-xs text-grey-600">
      {{ hidden }}, so the preview can't jump to it.
    </p>
    <p v-if="isEmpty" class="w-80 max-w-full text-sm text-grey-600">
      Add a question to see it here.
    </p>
    <PreviewFrame v-else v-model:shown="shown" v-model:missed="missed" />
  </aside>

  <!-- tablet and phone: over the document; closing it keeps it mounted, so focus goes back to Preview -->
  <Dialog :open="open && !isWide" class="relative z-40" @close="open = false">
    <div class="fixed inset-0 bg-grey-900/25" aria-hidden="true"></div>
    <DialogPanel
      class="fixed inset-y-0 right-0 flex w-full flex-col items-center gap-3 overflow-y-auto bg-grey-100 px-4 pb-4 pt-2 shadow-xl sm:w-[380px] sm:px-0"
    >
      <div class="flex w-80 max-w-full items-center justify-between">
        <DialogTitle class="text-xs font-semibold text-grey-600">{{
          heading
        }}</DialogTitle>
        <button
          type="button"
          class="-mr-3 flex h-11 w-11 items-center justify-center rounded-md text-grey-600 hover:bg-grey-200 hover:text-grey-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="open = false"
        >
          <span class="sr-only">Close preview</span>
          <D9Icon name="close" aria-hidden="true" />
        </button>
      </div>
      <p v-if="hidden" class="w-80 max-w-full text-xs text-grey-600">
        {{ hidden }}, so the preview can't jump to it.
      </p>
      <p v-if="isEmpty" class="w-80 max-w-full text-sm text-grey-600">
        Add a question to see it here.
      </p>
      <PreviewFrame v-else v-model:shown="shown" v-model:missed="missed" />
    </DialogPanel>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { D9Icon } from "@deck9/ui";
import { useMediaQuery } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { questionNumbers } from "@/components/Factory/Document/questionSummary";
import PreviewFrame from "./PreviewFrame.vue";

const open = defineModel<boolean>({ required: true });

const store = useForm();
const workbench = useWorkbench();
// loaded without questions (null while they load): a blank frame looks broken
const isEmpty = computed(() => store.blocks?.length === 0);

// numbered as in the document
const numbers = computed(() => questionNumbers(store.blocks ?? []));
const shown = ref<string | null>(null);
const missed = ref<string | null>(null);
const heading = computed(() => {
  const number = shown.value && numbers.value[shown.value];
  return number ? `Preview · question ${number}` : "Preview";
});
// the open question, when the preview couldn't go to it (a group has no number);
// the public form leaves out a hidden question and each one in a hidden group
const hidden = computed(() => {
  const block = workbench.block;
  const number =
    block && missed.value === block.uuid && numbers.value[block.uuid];
  if (!number) {
    return undefined;
  }

  if (block.is_disabled) {
    return `Question ${number} is hidden`;
  }

  const group = store.blocks?.find((item) => item.uuid === block.parent_block);
  return group?.is_disabled
    ? `Question ${number} is in a hidden group`
    : `Question ${number} is hidden by a rule`;
});

const isWide = useMediaQuery("(min-width: 1280px)");
// a narrower window or a turned tablet must not pop the panel over the document
watch(isWide, (wide) => {
  if (!wide) open.value = false;
});
</script>
