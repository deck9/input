<template>
  <app-layout title="Results" limit-height> Results </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { useForm } from "@/stores";
import { onUnmounted } from "vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

onUnmounted(() => {
  store.clearForm();
});

store.$patch({
  form: props.form,
});
</script>
