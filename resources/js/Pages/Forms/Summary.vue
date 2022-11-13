<template>
  <app-layout title="Submissions">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div v-if="store.form" class="flex w-full items-end justify-between">
        <FormSummary
          class="mt-6"
          v-bind="{ form: store.form, blocks: store.blocks || undefined }"
        />
      </div>

      <div
        class="mx-auto mt-4 grid max-w-screen-sm gap-6 lg:max-w-none lg:grid-cols-2"
        v-if="store.form?.total_sessions && store.form?.total_sessions > 0"
      >
        <BlockSubmissionItem
          :block="block"
          v-for="block in store.blocks"
          :key="block.id"
        />
      </div>

      <EmptyState
        class="mt-6"
        v-else
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
import BlockSubmissionItem from "@/components/Factory/Submissions/BlockSubmissionItem.vue";
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
