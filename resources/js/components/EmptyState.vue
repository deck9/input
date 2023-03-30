<template>
  <div
    class="relative block w-full rounded bg-grey-200 px-4 py-3 text-grey-600"
  >
    <div :class="isLoading ? 'opacity-0' : ''">
      <h3 class="font-heading font-medium text-grey-900">{{ title }}</h3>
      <small class="block font-sans text-sm">
        {{ description }}
      </small>
    </div>
    <div
      v-if="isLoading"
      class="absolute inset-0 flex items-center justify-center"
    >
      <D9Spinner />
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Spinner } from "@deck9/ui";

defineProps<{
  title: string;
  description: string;
  isLoading?: boolean;
}>();
</script>
