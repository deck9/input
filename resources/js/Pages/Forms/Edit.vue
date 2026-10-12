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
import { useSaveOnLeave } from "@/components/Factory/Shared/useSaveOnLeave";
import { onBeforeUnmount, onMounted } from "vue";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();

useSaveOnLeave();

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
