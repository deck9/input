<script setup>
defineProps({
  value: String,
});
</script>

<template>
  <label class="block font-medium text-sm text-grey-700 dark:text-grey-300">
    <span v-if="value">{{ value }}</span>
    <span v-else><slot /></span>
  </label>
</template>
