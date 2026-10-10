<template>
  <div class="relative flex space-x-2">
    <D9Button
      label="From template"
      color="dark"
      icon="cloud-upload"
      :isLoading="isImporting"
      :isDisabled="isImporting"
      @click="uploadInput?.click()"
    />
    <input
      type="file"
      class="hidden"
      ref="uploadInput"
      accept="application/json"
      @change="createFromTemplate"
    />
    <D9Button
      label="Create form"
      icon="add"
      iconPosition="right"
      :isLoading="isSubmitting"
      @click="createForm"
    />
    <ValidationErrors
      v-if="errors.length > 0"
      class="absolute right-0 top-full z-10 mt-2 w-80 rounded bg-white p-4 shadow"
      :errors="errors"
    />
  </div>
</template>

<script setup lang="ts">
import { D9Button } from "@deck9/ui";
import { ref } from "vue";
import { callCreateForm, callCreateFormFromTemplate } from "@/api/forms";
import { router } from "@inertiajs/vue3";
import { templateImportError } from "@/utils/templateImport";

import ValidationErrors from "@/components/ValidationErrors.vue";

const isSubmitting = ref(false);
const isImporting = ref(false);
const errors = ref<string[]>([]);
const uploadInput = ref<HTMLInputElement | null>(null);

const createFromTemplate = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  // else picking the same file again fires no change event
  input.value = "";

  if (!file) {
    return;
  }

  errors.value = [];

  try {
    // a broken file gets a plain message, not the server's file type rule
    JSON.parse(await file.text());

    const formName = window.prompt("Give your form a name");

    if (formName === null) {
      return;
    }

    isImporting.value = true;
    const response = await callCreateFormFromTemplate(file, formName);
    router.visit(window.route("forms.edit", { id: response.data.uuid }));
  } catch (error) {
    errors.value = [templateImportError(error)];
    isImporting.value = false;
  }
};

const createForm = async () => {
  const formName = window.prompt("Give your form a name");

  try {
    isSubmitting.value = true;

    let response = await callCreateForm(formName ?? undefined);

    if (response.status === 200) {
      router.visit(window.route("forms.edit", { id: response.data.uuid }));
    }
  } catch (error) {
    console.warn(error);
    setTimeout(() => {
      isSubmitting.value = false;
    }, 200);
  }
};
</script>
