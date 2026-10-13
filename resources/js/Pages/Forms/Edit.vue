<template>
  <app-layout title="Edit Form" limit-height>
    <template #preview><PreviewToggle v-model="isPreviewing" /></template>
    <FormDocument :status="status" @retry="loadBlocks">
      <!-- a phone's top bar has no room for Preview; a click inside lands on
        the button, so closing the preview puts focus back on it -->
      <template #actions>
        <D9Button
          class="lg:hidden [&_*]:pointer-events-none"
          label="Preview"
          color="light"
          icon="eye"
          icon-position="left"
          @click="isPreviewing = true"
        />
      </template>
    </FormDocument>
    <FormPreview v-model="isPreviewing" />
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import FormDocument from "@/components/Factory/Document/FormDocument.vue";
import FormPreview from "@/components/Factory/Preview/FormPreview.vue";
import PreviewToggle from "@/components/Factory/Preview/PreviewToggle.vue";
import { useForm, useWorkbench } from "@/stores";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { D9Button } from "@deck9/ui";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();
const status = ref<"loading" | "failed" | "loaded">("loading");
// on a desktop the preview sits beside the document, so it shows at once
const isPreviewing = ref(useMediaQuery("(min-width: 1280px)").value);

const loadBlocks = async () => {
  status.value = "loading";

  try {
    await store.getBlocks();
  } catch {
    if (!left) {
      status.value = "failed";
    }
    return;
  }

  // a late reply must not open a question, and so change the address, on the next page
  if (left) {
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

let left = false;

onBeforeUnmount(() => {
  left = true;
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
