<template>
  <div class="border-grey-200 flex min-h-full flex-grow flex-col border-r">
    <div
      v-if="!isLoaded"
      class="flex w-full items-center justify-center px-4 py-12"
    >
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="relative flex-grow">
      <div class="absolute inset-0 overflow-auto px-6 py-4">
        <BlockContainer />
      </div>
    </div>

    <div v-else class="flex flex-grow items-center px-4">
      <div
        class="flex flex-grow flex-col items-center justify-center rounded-lg border bg-white px-3 py-6 text-center"
      >
        <span class="font-bold">No blocks found</span>
        <span>Create your first block now</span>
      </div>
    </div>

    <div
      v-if="isLoaded"
      class="border-grey-200 flex items-center justify-center border-t bg-white px-4 py-3"
    >
      <D9Button
        label="Add block"
        color="dark"
        icon="plus"
        icon-position="right"
        @click="store.createFormBlock()"
      />

      <!-- <PrivacyToggle /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { D9Spinner, D9Button } from "@deck9/ui";
// import PrivacyToggle from "./PrivacyToggle.vue";
import BlockContainer from "./BlockContainer.vue";

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
