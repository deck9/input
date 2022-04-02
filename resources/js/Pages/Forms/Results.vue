<template>
  <app-layout title="Results" limit-height>
    <div class="w-full max-w-screen-lg py-6 text-left">
      <h3 class="text-slate-900 text-xl font-bold">Results</h3>

      <div class="mt-6 space-y-4">
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
  await Promise.all([store.getBlocks(), store.getFormBlockMapping()]);
});

store.$patch({
  form: props.form,
});
</script>
