<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl font-bold leading-8 text-grey-900">Updates</h2>
    </div>

    <div
      class="grid gap-y-4 space-x-2 sm:grid-cols-2 lg:block lg:space-x-0 lg:space-y-4"
    >
      <template v-if="isLoading && posts.length === 0">
        <div class="rounded-lg bg-grey-200 p-4">
          <D9Skeleton class="text-grey-300" footer :lines="4" />
        </div>
        <div class="rounded-lg bg-grey-200 p-4">
          <D9Skeleton class="text-grey-300" footer :lines="3" />
        </div>
      </template>

      <div v-else-if="posts.length === 0">No Updates</div>

      <UpdatePost
        v-for="post in posts"
        v-bind="{ post: post.attributes }"
        :key="post.id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import UpdatePost from "@/components/Dashboard/UpdatePost.vue";
import { ref, onMounted } from "vue";
import { D9Skeleton } from "@deck9/ui";
import { callChangelog } from "@/api/content";

const posts = ref<any[]>([]);
const isLoading = ref(true);

const DELAY = 500;

onMounted(async () => {
  try {
    // Fetches data from Strapi
    const strapi = await callChangelog(2, "PublishedDate:desc");
    // Sets posts.value after a delay to simulate a loading state
    setTimeout(() => {
      posts.value = strapi.data;
    }, DELAY);
  } catch (e) {
    console.warn("Could not fetch changelog");
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, DELAY);
  }
});
</script>
