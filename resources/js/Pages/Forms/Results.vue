<template>
  <app-layout title="Results">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div v-if="store.form" class="flex w-full items-end justify-between">
        <FormSummary
          class="mt-6"
          v-bind="{ form: store.form, blocks: store.blocks || undefined }"
        />
        <div class="space-x-2">
          <D9Button
            label="Purge Results"
            icon="trash"
            color="light"
            @click="purgeResults"
          />
          <D9Button
            label="Download Results"
            icon="cloud-download"
            color="dark"
            @click="downloadResultsExport"
          />
        </div>
      </div>

      <div
        class="mx-auto mt-4 grid max-w-screen-sm gap-6 lg:max-w-none lg:grid-cols-2"
        v-if="store.form?.total_sessions && store.form?.total_sessions > 0"
      >
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
import { callPurgeResults } from "@/api/forms";

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

const purgeResults = async () => {
  let confirm = window.confirm(
    "Are you sure you want to delete all collected data for this form? This actions is not reversible"
  );

  if (confirm) {
    await callPurgeResults(props.form);
    await store.refreshForm(true);
  }
};

store.$patch({
  form: props.form,
});
</script>
