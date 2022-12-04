<template>
  <div class="group relative flex cursor-pointer" @click="copySubmission">
    <span class="relative text-4xl font-bold">{{ average }}</span>
  </div>
</template>

<script lang="ts" setup>
import copy from "copy-text-to-clipboard";
import { computed } from "vue";

const props = defineProps<{
  responses: Record<string, any>;
}>();

const average = computed(() => {
  const sum = props.responses.reduce((carry, response) => {
    return carry + response.value;
  }, 0);

  return Math.round((sum / props.responses.length) * 100) / 100;
});

const copySubmission = () => {
  copy(`${average.value}`);
};
</script>
