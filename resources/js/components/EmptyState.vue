<template>
  <div
    class="font-heading block w-full rounded bg-grey-200 px-4 py-3 text-grey-700"
  >
    <h3 class="font-medium text-grey-900">{{ title }}</h3>
    <small class="block font-sans text-sm">
      {{ description }}
    </small>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
}>();
</script>
