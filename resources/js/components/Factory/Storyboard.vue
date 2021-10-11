<template>
  <div>{{ store.hasBlocks }}</div>
</template>


<script setup lang="ts">
import { callGetFormBlocks } from '@/api/blocks';
import { onMounted } from '@vue/runtime-core';
import { useForm } from '@/stores';

const store = useForm()


onMounted(async () => {
  if (store.form) {
    let response = await callGetFormBlocks(store.form.id)

    store.$patch({
      blocks: response.data
    })
  }
})
</script>
