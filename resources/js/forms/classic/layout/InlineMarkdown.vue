<template>
  <span class="form-message-prose" v-html="result"></span>
</template>

<script lang="ts" setup>
import markdownit from "markdown-it";

const props = defineProps<{
  content: string;
}>();

const md = markdownit();
const result = md.renderInline(props.content);
</script>
