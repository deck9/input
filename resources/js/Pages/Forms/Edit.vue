<template>
  <app-layout title="Edit Form" limit-height>
    <div class="grid grid-cols-12 w-full">
      <Storyboard class="col-span-6 lg:col-span-5 xl:col-span-4" />
      <div class="col-span-6 lg:col-span-7 xl:col-span-8 overflow-y-auto">
        <Workbench v-if="workbench.block" :key="workbench.block.id" />
      </div>
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import Storyboard from "@/components/Factory/Sidebar/Storyboard.vue";
import Workbench from "@/components/Factory/Main/Workbench.vue";
import { useForm, useWorkbench } from "@/stores";
import { onUnmounted } from "@vue/runtime-core";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();

onUnmounted(() => {
  store.clearForm();
});

store.$patch({
  form: props.form,
});
</script>
