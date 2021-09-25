<template>
  <div class="bg-grey-200 rounded-lg px-6 py-8">
    <h2 class="text-lg font-medium mb-4">{{ post.title }}</h2>
    <p class="text-sm leading-6">{{ post.excerpt }}</p>
    <div class="mt-4">
      <D9Button label="Read more" type="dark" icon="info-circle" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PostOrPage } from "@tryghost/content-api";
import { PropType } from "vue"
import { D9Button } from "@deck9/ui"

defineProps({
  post: {
    type: Object as PropType<PostOrPage>,
    required: true
  }
})
</script>
