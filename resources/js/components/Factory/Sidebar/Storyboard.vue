<template>
  <div
    class="relative flex min-h-full max-w-full shrink-0 flex-grow flex-col border-r border-grey-200 transition duration-100"
    :class="isResizing ? 'pointer-events-none select-none' : ''"
    :style="`width: ${sidebarWidth}px`"
    ref="sidebar"
  >
    <div
      class="group absolute inset-y-0 left-full hidden items-center border-l-2 border-transparent transition duration-200 sm:flex"
    >
      <div
        @mousedown="enableResize"
        class="-ml-[7px] flex h-9 w-3 cursor-[ew-resize] flex-col items-center justify-around rounded border border-grey-200 bg-grey-100 py-2 z-10"
      >
        <span
          class="block h-1 w-1 rounded bg-grey-300 transition duration-200 group-hover:bg-blue-400"
        ></span>
        <span
          class="block h-1 w-1 rounded bg-grey-300 transition duration-200 group-hover:bg-blue-400"
        ></span>
        <span
          class="block h-1 w-1 rounded bg-grey-300 transition duration-200 group-hover:bg-blue-400"
        ></span>
      </div>
    </div>

    <div v-if="status !== 'loaded'" class="p-4">
      <QuestionsLoadState :status="status" @retry="emit('retry')" />
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
      v-if="status === 'loaded'"
      class="flex items-center justify-center gap-x-2 border-t border-grey-200 bg-white px-4 py-3"
    >
      <D9Button
        label="Block"
        color="dark"
        icon="plus"
        icon-position="right"
        @click="store.createFormBlock()"
      />
      <D9Button
        label="Group"
        color="light"
        icon="layer-group"
        icon-position="right"
        @click="store.createFormBlock(null, 'group')"
      />
    </div>
  </div>
  <BlockLogicEditor />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "@/stores";
import { D9Button } from "@deck9/ui";
import { useStorage } from "@vueuse/core";
import BlockContainer from "./BlockContainer.vue";
import EmptyState from "@/components/EmptyState.vue";
import ScrollShadow from "@/components/ScrollShadow.vue";
import _throttle from "lodash/throttle";
import BlockLogicEditor from "@/components/Factory/Sidebar/BlockLogicEditor.vue";
import QuestionsLoadState from "@/components/Factory/Shared/QuestionsLoadState.vue";

defineProps<{
  status: "loading" | "failed" | "loaded";
}>();
const emit = defineEmits<{ retry: [] }>();

const store = useForm();

const isResizing = ref(false);
const sidebarWidth = useStorage("sidebar-width", 380, localStorage);
const maxSidebarWidth = 680;
const sidebarWidthStart = ref(0);
const mouseStart = ref(0);

const resize = _throttle((event) => {
  const delta = event.screenX - mouseStart.value;

  sidebarWidth.value = Math.min(
    maxSidebarWidth,
    Math.max(380, sidebarWidthStart.value + delta),
  );
}, 30);

const disableResize = () => {
  isResizing.value = false;

  document.body.style.removeProperty("cursor");

  document.removeEventListener("mousemove", resize);
  document.removeEventListener("mouseup", disableResize);
};

const enableResize = (event) => {
  isResizing.value = true;

  mouseStart.value = event.screenX;
  sidebarWidthStart.value = sidebarWidth.value;

  document.body.style.cursor = "ew-resize";

  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", disableResize);
};
</script>
