<template>
  <div class="py-4 flex justify-end items-center">
    <span
      class="text-xs text-grey-900 font-bold relative leading-none flex items-center mr-4"
      :class="store.form?.has_data_privacy ? 'text-blue-500' : 'text-grey-900'"
    >
      <D9Icon name="user-shield" class="mr-2 transition-lg" />Data Privacy Mode
    </span>
    <D9Switch label="Enable Data Privacy Mode" v-model="enabled" />
  </div>
</template>


<script setup lang="ts">
import { D9Icon, D9Switch } from '@deck9/ui';
import { ref, watch } from "vue"
import { useForm } from '@/stores';

const store = useForm()

const enabled = ref(store.form?.has_data_privacy ? true : false)

watch(enabled, async (change) => {
  await store.updateForm({ 'has_data_privacy': change })
  await store.getBlocks()
})
</script>
