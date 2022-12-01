<template>
  <div class="flex">
    <div
      ref="container"
      class="flex overflow-auto"
      :class="{
        'w-full flex-col': direction === 'vertical',
        'h-full flex-row': direction === 'vertical',
      }"
    >
      <!-- Start Detector -->
      <div ref="start" class="block shrink-0 basis-1 opacity-0"></div>
      <div class="grow-1">
        <slot></slot>
      </div>
      <!-- End Detector -->
      <div ref="end" class="block shrink-0 basis-1 opacity-0"></div>
    </div>

    <!-- Scroll Shadows -->
    <div
      class="pointer-events-none absolute from-black/10"
      :class="{
        'opacity-0': startIsVisible,
        'opacity-100': !startIsVisible,
        'inset-x-0 top-0 h-2 bg-gradient-to-b': direction === 'vertical',
        'inset-y-0 left-0 w-2 bg-gradient-to-r': direction === 'horizontal',
      }"
    ></div>
    <div
      class="pointer-events-none absolute from-black/10"
      :class="{
        'opacity-0': endIsVisible,
        'opacity-100': !endIsVisible,
        'inset-x-0 bottom-0 h-2 bg-gradient-to-t': direction === 'vertical',
        'inset-y-0 right-0 w-2 bg-gradient-to-l': direction === 'horizontal',
      }"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref } from "vue";
import { useIntersectionObserver } from "@vueuse/core";

withDefaults(
  defineProps<{
    direction: "vertical" | "horizontal";
  }>(),
  {
    direction: "vertical",
  }
);

const container = ref(null);

const start = ref(null);
const startIsVisible = ref(false);
const startObserver = useIntersectionObserver(
  start,
  ([{ isIntersecting }]) => {
    startIsVisible.value = isIntersecting;
  },
  {
    root: container,
  }
);

const end = ref(null);
const endIsVisible = ref(false);
const endObserver = useIntersectionObserver(
  end,
  ([{ isIntersecting }]) => {
    endIsVisible.value = isIntersecting;
  },
  {
    root: container,
  }
);

onBeforeUnmount(() => {
  startObserver.stop();
  endObserver.stop();
});
</script>
