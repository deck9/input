<template>
  <div class="relative flex space-x-2">
    <D9Button
      label="From template"
      color="dark"
      icon="cloud-upload"
      @click="uploadInput?.click()"
    />
    <input
      type="file"
      class="hidden"
      ref="uploadInput"
      accept="application/json"
      @change="pickTemplate"
    />
    <D9Button
      label="Create form"
      icon="add"
      iconPosition="right"
      @click="openDialog(null, '')"
    />
    <ValidationErrors
      v-if="errors.length > 0"
      class="absolute right-0 top-full z-10 mt-2 w-80 rounded bg-white p-4 shadow"
      :errors="errors"
    />
    <FormNameDialog
      :show="isNaming"
      title="Create form"
      label="Form name"
      confirmLabel="Create form"
      placeholder="Customer feedback"
      :defaultName="defaultName"
      :isSaving="isSaving"
      @close="isNaming = false"
      @submit="submitName"
    />
  </div>
</template>

<script setup lang="ts">
import { D9Button } from "@deck9/ui";
import { ref } from "vue";
import { callCreateForm, callCreateFormFromTemplate } from "@/api/forms";
import { router } from "@inertiajs/vue3";
import { templateImportError } from "@/utils/templateImport";

import FormNameDialog from "@/components/Dashboard/FormNameDialog.vue";
import ValidationErrors from "@/components/ValidationErrors.vue";

const isNaming = ref(false);
const isSaving = ref(false);
const template = ref<File | null>(null);
const defaultName = ref("");
const errors = ref<string[]>([]);
const uploadInput = ref<HTMLInputElement | null>(null);

const openDialog = (file: File | null, name: string) => {
  template.value = file;
  defaultName.value = name;
  isNaming.value = true;
};

const pickTemplate = async (event: Event) => {
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
  } catch (error) {
    errors.value = [templateImportError(error)];
    return;
  }

  openDialog(file, file.name.replace(/\.json$/i, ""));
};

const submitName = (formName: string) => {
  if (template.value) {
    createFromTemplate(template.value, formName);
  } else {
    createForm(formName);
  }
};

const createFromTemplate = async (file: File, formName: string) => {
  try {
    isSaving.value = true;
    const response = await callCreateFormFromTemplate(file, formName);
    router.visit(window.route("forms.edit", { id: response.data.uuid }));
  } catch (error) {
    // the name is fine, the file isn't: show why next to the buttons
    isNaming.value = false;
    isSaving.value = false;
    errors.value = [templateImportError(error)];
  }
};

const createForm = async (formName: string) => {
  try {
    isSaving.value = true;

    let response = await callCreateForm(formName || undefined);

    if (response.status === 200) {
      router.visit(window.route("forms.edit", { id: response.data.uuid }));
    }
  } catch (error) {
    console.warn(error);
    isSaving.value = false;
  }
};
</script>
