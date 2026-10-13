<template>
  <app-layout title="Edit Form" limit-height>
    <template #preview><PreviewToggle v-model="isPreviewing" /></template>
    <FormDocument :status="status" @retry="loadBlocks">
      <!-- a phone's top bar has no room for Preview; it looks like Outline beside it,
        an icon below sm; a click inside lands on the button, so closing the
        preview puts focus back on it -->
      <template #actions>
        <button
          type="button"
          class="flex h-11 w-11 items-center justify-center gap-1.5 rounded-md border border-grey-300 bg-white px-2.5 text-[13px] font-semibold text-grey-700 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:w-auto lg:hidden [&_*]:pointer-events-none"
          aria-haspopup="dialog"
          :aria-expanded="isPreviewing"
          @click="isPreviewing = true"
        >
          <D9Icon name="eye" aria-hidden="true" />
          <span class="sr-only sm:not-sr-only">Preview</span>
        </button>
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
import { useSaveOnLeave } from "@/components/Factory/Shared/useSaveOnLeave";
import { onBeforeUnmount, onMounted, provide, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { D9Icon } from "@deck9/ui";

const props = defineProps<{
  form: FormModel;
}>();

const store = useForm();
const workbench = useWorkbench();
const status = ref<"loading" | "failed" | "loaded">("loading");
// on a desktop the preview sits beside the document, so it shows at once
const isPreviewing = ref(useMediaQuery("(min-width: 1280px)").value);
// the form menu's Preview, for when the button above the questions scrolled away;
// it opens once the menu gave focus back to its button, so closing returns there
provide("openPreview", () => setTimeout(() => (isPreviewing.value = true)));

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

useSaveOnLeave();

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
