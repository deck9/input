<template>
  <app-layout title="Edit Form" limit-height>
    <FormDocument />
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import FormDocument from "@/components/Factory/Document/FormDocument.vue";
import { useForm, useWorkbench } from "@/stores";
import { onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();

onBeforeUnmount(() => {
  store.clearForm();
});

onMounted(async () => {
  await store.getFormBlockMapping();
});

workbench.clearWorkbench();
store.$patch({
  form: props.form,
});
</script>
