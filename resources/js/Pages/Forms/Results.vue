<template>
  <app-layout title="Results">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div class="flex w-full items-end justify-between">
        <FormSummary
          class="mt-6"
          v-bind="{ form, blocks: store.blocks || undefined }"
        />
        <D9Button
          label="Download Results"
          icon="cloud-download"
          color="dark"
          @click="downloadResultsExport"
        />
      </div>

      <div class="mt-4 grid gap-2 md:grid-cols-2" v-if="form.total_sessions">
        <BlockResultItem
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
import BlockResultItem from "@/components/Factory/Results/BlockResultItem.vue";
import EmptyState from "@/components/EmptyState.vue";
import { D9Button } from "@deck9/ui";

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

const downloadResultsExport = () => {
  window
    .open(
      window.route("forms.results-export", { form: props.form.uuid }),
      "_blank"
    )
    ?.focus();
};

store.$patch({
  form: props.form,
});
</script>
