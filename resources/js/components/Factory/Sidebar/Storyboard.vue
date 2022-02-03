<template>
  <div class="flex flex-col flex-grow min-h-full bg-grey-200">
    <div v-if="!isLoaded" class="flex items-center justify-center w-full px-4 py-12">
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="relative flex-grow px-4">
      <div class="absolute inset-0 px-3 py-4 overflow-auto">
        <BlockContainer />
      </div>
    </div>

    <div class="flex items-center flex-grow px-4" v-else>
      <div
        class="flex flex-col items-center justify-center flex-grow px-3 py-6 text-center bg-white border rounded-lg"
      >
        <span class="font-bold">No blocks found</span>
        <span>Create your first block now</span>
      </div>
    </div>

    <div
      v-if="isLoaded"
      class="flex items-center justify-between px-4 py-3 border-t bg-grey-300 border-slate-300"
    >
      <D9Button
        @click="store.createFormBlock()"
        label="Add block"
        color="dark"
        icon="plus"
        icon-position="right"
      />

      <PrivacyToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { D9Spinner, D9Button } from "@deck9/ui";
import PrivacyToggle from "./PrivacyToggle.vue";
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
