<template>
  <div class="bg-white flex flex-col flex-grow min-h-full px-4">
    <div v-if="!isLoaded" class="w-full py-12 flex items-center justify-center">
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="relative flex-grow">
      <div class="absolute pr-1 -mr-4 inset-0 overflow-auto space-y-3 scrollbar-gradient-white">
        <BlockContainer />
      </div>
    </div>

    <div class="flex flex-grow items-center" v-else>
      <div
        class="bg-grey-100 rounded-lg border px-3 py-6 text-center flex flex-col items-center justify-center flex-grow"
      >
        <span class="font-bold">No blocks found</span>
        <span>Create your first block now</span>
      </div>
    </div>

    <div v-if="isLoaded" class="flex items-center justify-between py-3">
      <D9Button
        @click="store.createFormBlock()"
        label="Add block"
        type="dark"
        icon="plus"
        icon-position="right"
      />

      <PrivacyToggle />
    </div>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useForm, useWorkbench } from '@/stores';
import { D9Spinner, D9Button } from "@deck9/ui";
import PrivacyToggle from './PrivacyToggle.vue';
import BlockContainer from './BlockContainer.vue';

const isLoaded = ref(false)
const store = useForm()
const workbench = useWorkbench()

onMounted(async () => {
  await store.getBlocks()

  if (!workbench.block && store.hasBlocks && store.blocks) {
    const params = new URLSearchParams(window.location.search);
    const values = Object.fromEntries(params.entries());
    const found = store.blocks.find((i) => i.uuid === values["block"])

    if (found) {
      workbench.putOnWorkbench(found)
    } else {
      workbench.putOnWorkbench(store.blocks[0])
    }
  }

  isLoaded.value = true
})
</script>
