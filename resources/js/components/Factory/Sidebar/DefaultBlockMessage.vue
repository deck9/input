<template>
  <div
    class="form-message-prose conversation-theme mb-4"
    :class="[{ 'max-h-44 overflow-hidden': isCollapsed }]"
    v-html="content"
  ></div>
</template>

<script lang="ts" setup>
defineProps<{
  content: string;
}>();
</script>
