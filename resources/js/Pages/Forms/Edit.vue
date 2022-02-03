<template>
  <app-layout title="Edit Form" limit-height>
    <div class="flex w-full">
      <Storyboard class="w-full max-w-lg" />
      <div class="w-full overflow-y-auto">
        <Workbench v-if="workbench.block" :key="workbench.block.id" />
        <FinalBlockSettings v-else-if="workbench.isEditingFinalBlock" />
      </div>
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import Storyboard from "@/components/Factory/Sidebar/Storyboard.vue";
import Workbench from "@/components/Factory/Main/Workbench.vue";
import FinalBlockSettings from "@/components/Factory/Main/FinalBlockSettings.vue";
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
