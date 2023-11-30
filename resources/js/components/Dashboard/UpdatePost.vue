<template>
  <div class="block rounded-lg bg-white px-6 py-8 shadow-sm">
    <h2 class="text-lg font-medium">{{ post.Title }}</h2>
    <span class="text-xs text-grey-500">{{ formattedDate }}</span>
    <p class="mt-2 text-sm leading-6">{{ post.Excerpt }}</p>
    <a
      class="relative"
      v-if="link"
      @click="trackRead"
      :href="link"
      target="_blank"
    >
      <D9Button class="mt-2" label="Read more" color="light" />
      <span
        v-if="!isRead"
        class="bg-blue-300 rounded px-2 py-px bg-gradient-to-bl from-purple-600 via-teal-400 to-blue-400 font-bold text-white uppercase text-xs top-0 absolute right-100 -mt-2 -ml-2"
        >New</span
      >
    </a>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Button } from "@deck9/ui";
import { useStorage } from "@vueuse/core";

const state = useStorage<Array<string>>("readPosts", []);

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

const isRead = computed(() => {
  return state.value.includes(props.post.Slug);
});

const trackRead = () => {
  if (isRead.value) {
    return;
  }

  state.value.push(props.post.Slug);
};

const formattedDate = computed(() => {
  if (!props.post.PublishedDate) {
    return;
  }

  const date = new Date(props.post.PublishedDate);
  return date.toLocaleDateString();
});
</script>
