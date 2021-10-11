<template>
  <div>{{ hasNoBlocks }}</div>
</template>


<script setup lang="ts">
import { computed } from "vue"

const hasNoBlocks = computed<boolean>(() => {
  return false;
})
</script>
