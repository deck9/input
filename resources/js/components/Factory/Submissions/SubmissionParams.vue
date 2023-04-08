<template>
  <div class="flex flex-wrap gap-1">
    <span
      class="whitespace-no-wrap inline-block rounded bg-grey-100 px-1 py-1 text-grey-800"
      v-for="item in paramsMap"
      :key="item.key"
    >
      <span class="mr-2 after:content-[':']">{{ item.key }}</span>
      <span>{{ item.value }}</span>
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  params?: string;
}>();

const paramsMap = computed(() => {
  if (!props.params) {
    return [];
  }

  const parsed =
    typeof props.params === "string" ? JSON.parse(props.params) : props.params;

  return Object.entries(parsed).map(([key, value]) => {
    return {
      key,
      value,
    };
  });
});
</script>
