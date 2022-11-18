<template>
  <div class="rounded-lg bg-white px-6 py-8 shadow-sm">
    <h2 class="text-lg font-medium">{{ post.Title }}</h2>
    <span class="text-xs text-grey-500">{{ formattedDate }}</span>
    <p class="mt-2 text-sm leading-6">{{ post.Excerpt }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const formattedDate = computed(() => {
  if (!props.post.PublishedDate) {
    return;
  }

  const date = new Date(props.post.PublishedDate);
  return date.toLocaleDateString();
});
</script>
