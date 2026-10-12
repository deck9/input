<template>
  <div class="relative flex h-full w-full">
    <div
      class="hidden w-[232px] shrink-0 overflow-y-auto border-r border-grey-200 bg-grey-50 xl:block"
    >
      <DocumentOutline
        v-if="status === 'loaded'"
        :numbers="numbers"
        @pick="pick"
      />
    </div>

    <div
      id="form-document"
      ref="root"
      class="h-full min-w-0 flex-1 overflow-y-auto bg-white"
    >
      <div
        class="mx-auto w-full max-w-[720px] px-2 pb-40 pt-6 sm:px-6 sm:pt-10"
      >
      <div v-if="status !== 'loaded'" class="pl-12">
        <QuestionsLoadState :status="status" @retry="retry" />
      </div>

      <template v-else>
        <h1 class="sr-only">Questions</h1>
        <div class="mb-4 flex items-center justify-between gap-2 pl-12">
          <p class="text-sm tabular-nums text-grey-600">{{ countLine }}</p>
          <!-- from lg it sits in the margin, out of the scrolling column, so it stays in view -->
          <button
            v-if="store.hasBlocks"
            type="button"
            class="flex h-11 items-center gap-1.5 rounded-md border border-grey-300 bg-white px-2.5 text-[13px] font-semibold text-grey-700 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-8 lg:absolute lg:left-4 lg:top-3 lg:z-10 xl:hidden"
            aria-haspopup="dialog"
            :aria-expanded="outlineOpen"
            @click="outlineOpen = true"
          >
            <D9Icon name="list-ul" aria-hidden="true" />
            Outline
          </button>
        </div>

        <DocumentList v-if="store.hasBlocks" :numbers="numbers" />
        <EmptyState
          v-else
          title="No questions yet"
          description="Add your first question below."
        />

        <div ref="addButtons" class="mt-4 flex flex-wrap gap-2 pl-12">
          <D9Button
            label="Add question"
            color="dark"
            icon="plus"
            icon-position="left"
            @click="addBlock()"
          />
          <D9Button
            label="Add group"
            color="light"
            icon="layer-group"
            icon-position="left"
            @click="addBlock(null, 'group')"
          />
        </div>
      </template>
      </div>
    </div>
  </div>

  <Dialog
    :open="outlineOpen"
    class="relative z-50 xl:hidden"
    aria-label="Outline"
    @close="outlineOpen = false"
  >
    <div class="fixed inset-0 bg-grey-900/20" aria-hidden="true" />
    <DialogPanel
      class="fixed inset-y-0 left-0 w-[232px] overflow-y-auto border-r border-grey-200 bg-grey-50 shadow-xl"
    >
      <DocumentOutline :numbers="numbers" @pick="pick">
        <template #close>
          <button
            type="button"
            aria-label="Close outline"
            class="grid h-11 w-11 place-items-center rounded-md text-grey-600 hover:bg-grey-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-8 sm:w-8"
            @click="outlineOpen = false"
          >
            <D9Icon name="xmark" />
          </button>
        </template>
      </DocumentOutline>
    </DialogPanel>
  </Dialog>
  <BlockLogicEditor />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { Dialog, DialogPanel } from "@headlessui/vue";
import { D9Button, D9Icon } from "@deck9/ui";
import { useForm, useWorkbench } from "@/stores";
import EmptyState from "@/components/EmptyState.vue";
import QuestionsLoadState from "@/components/Factory/Shared/QuestionsLoadState.vue";
import BlockLogicEditor from "@/components/Factory/Sidebar/BlockLogicEditor.vue";
import DocumentList from "./DocumentList.vue";
import DocumentOutline from "./DocumentOutline.vue";
import { questionNumbers } from "./questionSummary";
import {
  cursorFor,
  focusBlock,
  scrollToBlock,
  useAddBlock,
} from "./blockFocus";

const props = defineProps<{
  status: "loading" | "failed" | "loaded";
}>();
const emit = defineEmits<{ retry: [] }>();

const store = useForm();
const workbench = useWorkbench();
const { addBlock } = useAddBlock();
const root = ref<HTMLElement | null>(null);
const addButtons = ref<HTMLElement | null>(null);

// Try again leaves the page: its button is gone once the load ends
let retried = false;
const retry = () => {
  retried = true;
  emit("retry");
};

watch(
  () => props.status,
  async (status) => {
    if (!retried || status === "loading") {
      return;
    }

    retried = false;

    if (status === "loaded" && (await focusBlock(workbench.block))) {
      return;
    }

    await nextTick();
    const fallback =
      status === "failed"
        ? root.value?.querySelector<HTMLElement>("[role=alert] button")
        : addButtons.value?.querySelector("button");
    fallback?.focus();
  },
);

// a question opened by link (?block=) may sit far down
watch(
  () => props.status,
  (status) => {
    if (status === "loaded" && workbench.block) {
      scrollToBlock(workbench.block.uuid);
    }
  },
);

const outlineOpen = ref(false);

// jumps to a question and puts the cursor in it
const pick = async (block: FormBlockModel) => {
  outlineOpen.value = false;
  // the closing panel gives focus back to its button first
  await nextTick();
  cursorFor.value = block.uuid;
  workbench.putOnWorkbench(block);
  scrollToBlock(block.uuid);
};

const numbers = computed(() => questionNumbers(store.blocks ?? []));

const countLine = computed(() => {
  const questions = Object.keys(numbers.value).length;
  const groups = (store.blocks ?? []).filter(
    (block) => block.type === "group",
  ).length;
  const parts = [`${questions} ${questions === 1 ? "question" : "questions"}`];

  if (groups) {
    parts.push(`${groups} ${groups === 1 ? "group" : "groups"}`);
  }

  return parts.join(" · ");
});
</script>
