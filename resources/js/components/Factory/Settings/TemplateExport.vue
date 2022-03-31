<template>
  <div>
    <div class="mb-4">
      <D9Label label="Export Template" />
      <textarea
        v-if="template"
        class="mono-50 block w-full rounded border-grey-300 bg-white py-3 pl-4 pr-10 text-sm leading-4 text-grey-800 placeholder:font-normal placeholder:text-grey-400 focus:border-blue-400 focus:ring-blue-400 dark:border-grey-700 dark:bg-grey-800 dark:text-grey-100 dark:placeholder:text-grey-500 dark:focus:border-blue-800 dark:focus:ring-blue-800"
        rows="10"
        readonly
        :value="template"
      ></textarea>
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
import { D9Label, D9Button } from "@deck9/ui";
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
