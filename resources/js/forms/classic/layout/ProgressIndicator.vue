<template>
  <div class="flex items-center">
    <div class="h-6 w-6">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <circle
          :r="radius"
          cx="100"
          cy="100"
          fill="transparent"
          :stroke-width="width"
          stroke="currentColor"
          class="text-content/20"
        />
        <circle
          :r="radius"
          cx="100"
          cy="100"
          fill="transparent"
          :stroke-width="width"
          stroke="currentColor"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          class="text-primary transition-all duration-300"
        />
      </svg>
    </div>
    <span class="ml-1 w-10 text-left text-sm font-medium text-content"
      >{{ progress }}%</span
    >
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{
    progress: number;
    width?: number;
  }>(),
  {
    width: 30,
  }
);

const radius = ref(100 - props.width / 2);
const circumference = ref(Math.PI * (radius.value * 2));

const offset = computed(() => {
  return ((100 - props.progress) / 100) * circumference.value;
});
</script>
