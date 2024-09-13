<template>
  <app-layout title="Edit Form" limit-height>
    <div class="flex w-full">
      <Storyboard />
      <div class="w-full overflow-y-auto">
        <Workbench v-if="workbench.block" :key="workbench.block.id" />
        <WorkbenchEmpty v-else />
      </div>
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import Storyboard from "@/components/Factory/Sidebar/Storyboard.vue";
import Workbench from "@/components/Factory/Main/Workbench.vue";
import WorkbenchEmpty from "@/components/Factory/Main/WorkbenchEmpty.vue";
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

<style>
:root {
  --color-primary: 59, 130, 246;
  --color-contrast: 239, 246, 255;
  --color-background: 255, 255, 255;
  --color-content: 0, 0, 0;
  --brightness-user: 59, 130, 246;
}
</style>
