<template>
  <div>
    <div class="mb-4">
      <D9Label label="Export Template" />
      <D9Textarea v-if="template" readonly v-model="template" block />
    </div>
    <div class="mb-4">
      <D9Label label="Import Template" />
      <div class="mt-2">
        <D9Button
          label="Load Template"
          :isLoading="isImporting"
          :isDisabled="isImporting"
          @click="openImport"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { callGetFormTemplate, callImportFormTemplate } from "@/api/forms";
import { useForm } from "@/stores";
import { D9Label, D9Button, D9Textarea } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const template = ref<string | null>(null);

callGetFormTemplate(store.form?.id).then((response) => {
  template.value = JSON.stringify(response.data);
});

const isImporting = ref(false);
const openImport = async () => {
  const template = window.prompt("Please insert your template");

  if (template) {
    isImporting.value = true;

    try {
      const response = await callImportFormTemplate(store.form?.id, template);

      if (response.status === 200) {
        await store.refreshForm();
      }

      isImporting.value = false;
    } catch (error) {
      console.warn("something went wrong", error);
    }
  }

  isImporting.value = false;
};
</script>
