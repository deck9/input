<template>
  <D9Button
    label="Create form"
    icon="user"
    iconPosition="right"
    :isLoading="isSubmitting"
    @click="createForm"
  />
</template>

<script setup lang="ts">
import { D9Button } from "@deck9/ui";
import { ref } from "vue";
import { callCreateForm } from "@/api/forms";
import { Inertia } from "@inertiajs/inertia";

const isSubmitting = ref(false);

const createForm = async () => {
  try {
    isSubmitting.value = true;

    let response = await callCreateForm();

    if (response.status === 200) {
      Inertia.visit(window.route("forms.edit", { id: response.data.uuid }));
    }
  } catch (error) {
    setTimeout(() => {
      isSubmitting.value = false;
    }, 200);
  }
};
</script>
