<template>
  <div>
    <form @submit.prevent="deleteForm">
      <D9Button
        type="submit"
        color="danger"
        label="Delete Form"
        :is-loading="isSaving"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const deleteForm = async () => {
  if (window.confirm("Are you sure you want to delete this form?")) {
    isSaving.value = true;

    await store.deleteForm();
    window.location.href = window.route("dashboard");
  }
};
</script>
