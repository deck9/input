<template>
  <component
    :is="link ? 'a' : 'div'"
    target="_blank"
    :href="link"
    class="block rounded-lg bg-white px-6 py-8 shadow-sm"
  >
    <h2 class="text-lg font-medium">{{ post.Title }}</h2>
    <span class="text-xs text-grey-500">{{ formattedDate }}</span>
    <p class="mt-2 text-sm leading-6">{{ post.Excerpt }}</p>
    <D9Button class="mt-2" label="Read more" color="light" />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Button } from "@deck9/ui";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const link = computed<string | null>(() => {
  if (!props.post.Body || !props.post.Slug) {
    return null;
  }

  return `https://getinput.co/changelog/${props.post.Slug}`;
});

const formattedDate = computed(() => {
  if (!props.post.PublishedDate) {
    return;
  }

  const date = new Date(props.post.PublishedDate);
  return date.toLocaleDateString();
});
</script>
