<template>
  <div
    class="form-message-prose conversation-theme mb-4"
    v-html="content"
  ></div>
</template>

<script lang="ts" setup>
defineProps<{
  content: string;
}>();
</script>
