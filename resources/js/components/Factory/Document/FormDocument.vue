<template>
  <div
    id="form-document"
    ref="root"
    class="h-full w-full overflow-y-auto bg-white"
  >
    <div class="mx-auto w-full max-w-[720px] px-2 pb-40 pt-6 sm:px-6 sm:pt-10">
      <div v-if="status !== 'loaded'" class="pl-12">
        <QuestionsLoadState :status="status" @retry="retry" />
      </div>

      <template v-else>
        <h1 class="sr-only">Questions</h1>
        <p class="mb-4 pl-12 text-sm tabular-nums text-grey-600">
          {{ countLine }}
        </p>

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
  <BlockLogicEditor />
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { D9Button } from "@deck9/ui";
import { useForm, useWorkbench } from "@/stores";
import EmptyState from "@/components/EmptyState.vue";
import QuestionsLoadState from "@/components/Factory/Shared/QuestionsLoadState.vue";
import BlockLogicEditor from "@/components/Factory/Sidebar/BlockLogicEditor.vue";
import DocumentList from "./DocumentList.vue";
import { questionNumbers } from "./questionSummary";
import { focusBlock, useAddBlock } from "./blockFocus";

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
