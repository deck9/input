<template>
  <div class="bg-grey-100 py-8 border-b">{{ block.uuid }} - {{ block.type }} - {{ block.sequence }}</div>
</template>

<script setup lang="ts">
const props = defineProps<{
  block: FormBlockModel
}>()
</script>
