<template>
  <app-layout title="Submissions">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div
        class="mx-auto mt-8 grid max-w-screen-sm gap-6 lg:max-w-none lg:grid-cols-2"
        v-if="
          store.form?.completed_sessions && store.form?.completed_sessions > 0
        "
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
import { onMounted, onBeforeUnmount } from "vue";
import BlockSubmissionItem from "@/components/Factory/Submissions/BlockSubmissionItem.vue";
import EmptyState from "@/components/EmptyState.vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

onBeforeUnmount(() => {
  store.clearForm();
});

onMounted(async () => {
  await Promise.all([store.getBlocks(true), store.getFormBlockMapping()]);
});

store.$patch({
  form: props.form,
});
</script>
