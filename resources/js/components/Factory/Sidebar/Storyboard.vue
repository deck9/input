<template>
  <div
    class="relative flex min-h-full shrink-0 flex-grow flex-col border-r border-grey-200 transition duration-100"
    :class="isResizing ? 'pointer-events-none select-none' : ''"
    :style="`width: ${sidebarWidth}px`"
  >
    <div
      class="group absolute inset-y-0 left-full hidden items-center border-l-2 border-transparent transition duration-200 hover:border-grey-400 md:flex"
    >
      <div
        @mousedown="enableResize"
        class="-ml-[5px] h-9 w-2 cursor-[ew-resize] rounded border border-grey-300 bg-grey-200"
      ></div>
    </div>

    <div
      v-if="!isLoaded"
      class="flex w-full items-center justify-center px-4 py-12"
    >
      <D9Spinner class="text-blue-300 opacity-50" />
    </div>

    <div v-else-if="store.hasBlocks" class="relative flex-grow">
      <ScrollShadow class="absolute inset-0">
        <BlockContainer id="smooth-dnd-container" class="py-4 px-4" />
      </ScrollShadow>
    </div>

    <div v-else class="flex flex-grow items-center px-4">
      <EmptyState
        title="No blocks found"
        description="Create your first block now"
      />
    </div>

    <div
      v-if="isLoaded"
      class="flex items-center justify-center gap-x-2 border-t border-grey-200 bg-white px-4 py-3"
    >
      <D9Button
        label="Create Block"
        color="dark"
        icon="plus"
        icon-position="right"
        @click="store.createFormBlock()"
      />
      <D9Button
        label="Create Group"
        color="light"
        icon="file-lines"
        icon-position="right"
        @click="store.createFormBlock(null, 'group')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useForm, useWorkbench } from "@/stores";
import { D9Spinner, D9Button } from "@deck9/ui";
import BlockContainer from "./BlockContainer.vue";
import EmptyState from "@/components/EmptyState.vue";
import ScrollShadow from "@/components/ScrollShadow.vue";
import _throttle from "lodash/throttle";

const isLoaded = ref(false);
const store = useForm();
const workbench = useWorkbench();

const isResizing = ref(false);
const sidebarWidth = ref(380);

const resize = _throttle((event) => {
  sidebarWidth.value = Math.max(380, event.screenX);
}, 30);

const disableResize = () => {
  isResizing.value = false;

  document.body.style.removeProperty("cursor");

  document.removeEventListener("mousemove", resize);
  document.removeEventListener("mouseup", disableResize);
};

const enableResize = () => {
  isResizing.value = true;

  document.body.style.cursor = "ew-resize";

  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", disableResize);
};

onMounted(async () => {
  await store.getBlocks();

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

  isLoaded.value = true;
});
</script>
