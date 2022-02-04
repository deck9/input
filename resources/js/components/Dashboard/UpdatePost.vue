<template>
  <div class="rounded-lg bg-grey-200 px-6 py-8">
    <h2 class="mb-4 text-lg font-medium">{{ post.title }}</h2>
    <p class="text-sm leading-6">{{ post.excerpt }}</p>
    <div class="mt-4">
      <D9Button label="Read more" color="dark" icon="info-circle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PostOrPage } from "@tryghost/content-api";
import { PropType } from "vue";
import { D9Button } from "@deck9/ui";

defineProps({
  post: {
    type: Object as PropType<PostOrPage>,
    required: true,
  },
});
</script>
