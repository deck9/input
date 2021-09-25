<template>
  <div>
    <div class="mb-6">
      <h2 class="text-xl leading-8 text-grey-900 font-bold">Updates</h2>
    </div>

    <div class="space-y-4">
      <UpdatePost v-for="post in posts" v-bind="{ post }" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { PostOrPage } from '@tryghost/content-api'
import UpdatePost from "@/components/Dashboard/UpdatePost.vue"
import { ref, onMounted } from "vue"
import api from "@/utils/content-api"

const posts = ref<PostOrPage[]>([])

onMounted(async () => {
  const response = await api.posts.browse({ limit: 3, filter: 'tag:survy-dashboard' })
  posts.value = response
})
</script>
