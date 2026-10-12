<template>
  <app-layout title="Edit Form" limit-height>
    <FormDocument :status="status" @retry="loadBlocks" />
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import FormDocument from "@/components/Factory/Document/FormDocument.vue";
import { useForm, useWorkbench } from "@/stores";
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();
const status = ref<"loading" | "failed" | "loaded">("loading");

const loadBlocks = async () => {
  status.value = "loading";

  try {
    await store.getBlocks();
  } catch {
    status.value = "failed";
    return;
  }

  if (!workbench.block && store.hasBlocks && store.blocks) {
    const params = new URLSearchParams(window.location.search);
    const values = Object.fromEntries(params.entries());
    const found = store.blocks.find((i) => i.uuid === values["block"]);

    if (found) {
      workbench.putOnWorkbench(found);
    } else {
      workbench.putOnWorkbench(store.blocks[0]);
    }
  }

  status.value = "loaded";
};

onBeforeUnmount(() => {
  store.clearForm();
});

onMounted(async () => {
  loadBlocks();
  await store.getFormBlockMapping();
});

workbench.clearWorkbench();
store.$patch({
  form: props.form,
});
</script>
