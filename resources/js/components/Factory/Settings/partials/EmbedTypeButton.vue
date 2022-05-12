<template>
  <button
    class="flex h-20 items-center justify-start rounded border-2 bg-white p-2 text-grey-600 shadow"
    :class="isActive ? 'border-blue-400 font-bold' : 'border-transparent'"
  >
    <img class="mr-3 h-16" :src="icon" :alt="label" />
    <span>{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  icon?: string;
  isActive?: boolean;
}>();
</script>
