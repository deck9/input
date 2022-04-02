<template>
  <app-layout title="Results">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <FormSummary
        class="mt-6"
        v-bind="{ form, blocks: store.blocks || undefined }"
      />

      <div class="mt-6 space-y-6">
        <BlockResultItem
          :block="block"
          v-for="block in store.blocks"
          :key="block.id"
        />
      </div>

      <EmptyState
        v-if="!store.blocks?.length"
        title="No results found"
        description="There are no results to show right now"
      />
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { useForm } from "@/stores";
import { onMounted, onUnmounted } from "vue";
import FormSummary from "@/components/Factory/FormSummary.vue";
import BlockResultItem from "@/components/Factory/Results/BlockResultItem.vue";
import EmptyState from "@/components/EmptyState.vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

onUnmounted(() => {
  store.clearForm();
});

onMounted(async () => {
  await Promise.all([store.getBlocks(true), store.getFormBlockMapping()]);
});

store.$patch({
  form: props.form,
});
</script>
