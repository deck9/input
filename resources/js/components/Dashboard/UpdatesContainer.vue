<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold leading-8 text-grey-900">Updates</h2>
    </div>

    <div
      class="grid gap-y-4 space-x-2 sm:grid-cols-2 lg:block lg:space-x-0 lg:space-y-4"
    >
      <div class="rounded-lg bg-grey-200 p-4" v-if="posts.length === 0">
        <D9Skeleton class="text-grey-300" footer />
      </div>
      <UpdatePost v-for="post in posts" v-bind="{ post }" :key="post.id" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PostOrPage } from "@tryghost/content-api";
import UpdatePost from "@/components/Dashboard/UpdatePost.vue";
import { ref, onMounted } from "vue";
import api from "@/utils/content-api";
import { D9Skeleton } from "@deck9/ui";

const posts = ref<PostOrPage[]>([]);

onMounted(async () => {
  const response = await api.posts.browse({
    limit: 2,
    filter: "tag:input-dashboard",
  });
  setTimeout(() => {
    posts.value = response;
  }, 300);
});
</script>
