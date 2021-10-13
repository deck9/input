<template>
  <div class="bg-white flex flex-col flex-grow min-h-full px-4">
    <PrivacyToggle />

    <div v-if="!isLoaded" class="w-full py-12 flex items-center justify-center">
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="overflow-y-auto pb-32 scrollbar-hidden hover:scrollbar"></div>

    <div class="flex flex-grow items-center" v-else>
      <div
        class="bg-grey-100 rounded-lg border px-3 py-6 text-center flex flex-col items-center justify-center flex-grow"
      >
        <span class="font-bold">No blocks found</span>
        <span>Create your first block now</span>
      </div>
    </div>

    <div v-if="isLoaded" class="text-center py-3">
      <D9Button
        @click="store.createFormBlock()"
        label="Add block"
        type="dark"
        icon="plus"
        icon-position="right"
      />
    </div>
  </div>
</template>


<script setup lang="ts">
import { callGetFormBlocks } from '@/api/blocks';
import { onMounted, ref } from 'vue';
import { useForm } from '@/stores';
import { D9Spinner, D9Button } from "@deck9/ui";
import PrivacyToggle from './PrivacyToggle.vue';

const isLoaded = ref(false)
const store = useForm()

onMounted(async () => {
  if (store.form) {
    let response = await callGetFormBlocks(store.form.id)

    setTimeout(() => {
      store.$patch({
        blocks: response.data
      })

      isLoaded.value = true;
    }, 1)
  }
})
</script>
