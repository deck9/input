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

callGetFormTemplate(store.form?.uuid).then((response) => {
  template.value = JSON.stringify(response.data);
});

const isImporting = ref(false);

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

    try {
      const response = await callImportFormTemplate(store.form?.uuid, file);

      if (response.status === 200) {
        await store.refreshForm();
      }

      isImporting.value = false;
    } catch (error) {
      console.warn("something went wrong", error);
    }

    isImporting.value = false;
  }
};
</script>
