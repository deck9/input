<template>
  <div v-if="status === 'loading'" role="status" class="space-y-2">
    <span class="sr-only">Loading questions</span>
    <D9Skeleton
      v-for="row in 6"
      :key="row"
      :title="false"
      :lines="0"
      aria-hidden="true"
      class="h-14 rounded-md bg-grey-200 motion-reduce:animate-none"
    />
  </div>

  <div
    v-else
    role="alert"
    class="rounded-lg border border-grey-200 bg-white p-4 text-center"
  >
    <p class="text-sm font-medium text-grey-900">
      Couldn't load the questions.
    </p>
    <D9Button
      class="mt-4 h-11 sm:h-auto"
      color="light"
      label="Try again"
      @click="emit('retry')"
    />
  </div>
</template>

<script setup lang="ts">
import { D9Button, D9Skeleton } from "@deck9/ui";

defineProps<{
  status: "loading" | "failed";
}>();
const emit = defineEmits<{ retry: [] }>();
</script>
