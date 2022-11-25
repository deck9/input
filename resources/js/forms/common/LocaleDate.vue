<template>
  <span>{{ formattedDate }}</span>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  date: string;
}>();

const formattedDate = computed(() => {
  return new Date(props.date).toLocaleString(navigator.language, {
    dateStyle: "medium",
    timeStyle: "short",
  });
});
</script>
