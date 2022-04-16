<template>
  <div class="flex min-h-full flex-grow flex-col border-r border-grey-200">
    <div
      v-if="!isLoaded"
      class="flex w-full items-center justify-center px-4 py-12"
    >
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="relative flex-grow">
      <div class="absolute inset-0 overflow-auto px-4 py-4">
        <BlockContainer />
      </div>
    </div>

    <div v-else class="flex flex-grow items-center px-4">
      <EmptyState
        title="No blocks found"
        description="Create your first block now"
      />
    </div>

    <div
      v-if="isLoaded"
      class="flex items-center justify-center border-t border-grey-200 bg-white px-4 py-3"
    >
      <D9Button
        label="Add block"
        color="dark"
        icon="plus"
        icon-position="right"
        @click="store.createFormBlock()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { D9Spinner, D9Button } from "@deck9/ui";
import BlockContainer from "./BlockContainer.vue";
import EmptyState from "@/components/EmptyState.vue";

const isLoaded = ref(false);
const store = useForm();
const workbench = useWorkbench();

onMounted(async () => {
  await store.getBlocks();

  if (!workbench.block && store.hasBlocks && store.blocks) {
    const params = new URLSearchParams(window.location.search);
    const values = Object.fromEntries(params.entries());
    const found = store.blocks.find((i) => i.uuid === values["block"]);

    if (values["block"] === "final") {
      workbench.editFinalBlock();
    } else if (found) {
      workbench.putOnWorkbench(found);
    } else {
      workbench.putOnWorkbench(store.blocks[0]);
    }
  }

  isLoaded.value = true;
});
</script>
