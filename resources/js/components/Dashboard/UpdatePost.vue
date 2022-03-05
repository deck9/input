<template>
  <div class="rounded-lg bg-white px-6 py-8 shadow-sm">
    <h2 class="text-lg font-medium">{{ post.title }}</h2>
    <span class="text-xs text-grey-500">{{ formattedDate }}</span>
    <p class="mt-2 text-sm leading-6">{{ post.excerpt }}</p>
    <div class="mt-4" v-if="post.featured">
      <D9Button label="Read more" color="dark" icon="info-circle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PostOrPage } from "@tryghost/content-api";
import { computed, PropType } from "vue";
import { D9Button } from "@deck9/ui";

const props = defineProps({
  post: {
    type: Object as PropType<PostOrPage>,
    required: true,
  },
});

const formattedDate = computed(() => {
  if (!props.post.published_at) {
    return;
  }

  const date = new Date(props.post.published_at);
  return date.toLocaleDateString();
});
</script>
