<template>
  <app-layout title="Edit Form" limit-height>
    <div class="flex w-full">
      <Storyboard :status="status" @retry="loadBlocks" />
      <div class="w-full overflow-y-auto">
        <Workbench v-if="workbench.block" :key="workbench.block.id" />
        <div
          v-else-if="status === 'loading'"
          aria-hidden="true"
          class="mx-12 max-w-xl space-y-4 px-4 pt-8 xl:mx-24"
        >
          <D9Skeleton
            v-for="bar in ['h-8 w-3/5', 'h-24', 'h-11 w-3/4']"
            :key="bar"
            :title="false"
            :lines="0"
            class="rounded-md bg-grey-200 motion-reduce:animate-none"
            :class="bar"
          />
        </div>
        <WorkbenchEmpty v-else-if="status === 'loaded' && !store.hasBlocks" />
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
import { D9Skeleton } from "@deck9/ui";
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

useSaveOnLeave();

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
