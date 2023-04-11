<template>
  <app-layout title="Edit Form" limit-height>
    <div class="mt-8 w-full max-w-screen-md">
      <Integrations />
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { useForm } from "@/stores";
import { onBeforeUnmount } from "vue";
import Integrations from "@/components/Factory/Integrations/Integrations.vue";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();

onBeforeUnmount(() => {
  store.clearForm();
});

store.$patch({
  form: props.form,
});
</script>
