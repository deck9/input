<template>
  <div>
    <div class="mb-4">
      <D9Label label="Template Files" />
      <div class="mt-2 flex space-x-2">
        <D9Button
          label="Download"
          color="dark"
          @click="downloadTemplate"
          icon="cloud-download"
        />
        <D9Button
          label="Import"
          :isLoading="isImporting"
          :isDisabled="isImporting"
          icon="cloud-upload"
          @click="initUpload"
        />
        <input
          type="file"
          class="hidden"
          ref="uploadInput"
          accept="application/json"
          @change="selectFiles"
        />
      </div>
      <ValidationErrors
        v-if="errors.length > 0"
        class="mt-2"
        :errors="errors"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { callGetFormTemplate, callImportFormTemplate } from "@/api/forms";
import { useForm } from "@/stores";
import { D9Label, D9Button } from "@deck9/ui";
import { ref } from "vue";
import { templateImportError } from "@/utils/templateImport";

import ValidationErrors from "@/components/ValidationErrors.vue";

const store = useForm();
const template = ref<string | null>(null);

callGetFormTemplate(store.form?.uuid).then((response) => {
  template.value = JSON.stringify(response.data);
});

const isImporting = ref(false);
const errors = ref<string[]>([]);

const downloadTemplate = () => {
  const form = store.form?.uuid;

  if (form) {
    window
      .open(window.route("forms.template-download", { form }), "_blank")
      ?.focus();
  }
};

const uploadInput = ref<HTMLInputElement | null>(null);

const initUpload = () => {
  isImporting.value = true;
  uploadInput.value?.click();

  setTimeout(() => {
    isImporting.value = false;
  }, 2000);
};

const selectFiles = async (payload: Event) => {
  const files = (payload?.target as HTMLInputElement).files;

  if (files && files.length > 0) {
    const file = files[0];

    isImporting.value = true;
    errors.value = [];

    try {
      // a broken file gets a plain message, not the server's file type rule
      JSON.parse(await file.text());
      const response = await callImportFormTemplate(store.form?.uuid, file);

      if (response.status === 200) {
        await store.refreshForm();
      }

      isImporting.value = false;
    } catch (error) {
      errors.value = [templateImportError(error)];
    }

    // else picking the same file again fires no change event
    (payload.target as HTMLInputElement).value = "";
    isImporting.value = false;
  }
};
</script>
