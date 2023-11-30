<template>
  <span
    v-if="maxChars"
    class="text-xs"
    :class="[
      hasMaxChars && charCount > maxChars
        ? 'font-medium text-red-600'
        : 'text-content/80',
    ]"
  >
    {{ charCount }}
    <span v-if="hasMaxChars">/ {{ maxChars }}</span>
  </span>
</template>

<script lang="ts" setup>
import { watch } from "vue";
import { computed, ref } from "vue";

const props = defineProps<{
  text?: string;
  maxChars?: number;
}>();

const charCount = ref<number>(props.text?.length ?? 0);

const hasMaxChars = computed(() => {
  return props.maxChars && props.maxChars > 0;
});

watch(
  () => props.text,
  () => {
    updateCharCount();
  },
);

const updateCharCount = () => {
  if (props.text) {
    charCount.value = props.text.length;
  } else {
    charCount.value = 0;
  }
};
</script>
