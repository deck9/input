<template>
  <div
    class="form-message-prose conversation-theme mb-4"
    v-html="sanitizeHtml(content)"
  ></div>
</template>

<script lang="ts" setup>
import { sanitizeHtml } from "@/utils/sanitize";

defineProps<{
  content: string;
}>();
</script>
