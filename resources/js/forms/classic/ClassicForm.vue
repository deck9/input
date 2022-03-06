<template>
  <div class="bg-grey-900 px-8 py-6 font-mono text-xs text-grey-400">
    <pre>{{ settings }}</pre>
  </div>
</template>

<script lang="ts" setup>
import { useConversation } from "@/stores/conversation";

const props = defineProps<{
  settings: any;
}>();

const store = useConversation();
store.initForm(props.settings.uuid);

// how to start a form session

// offline usage
// 1. we need to get information about the form
// 2. we need to get the forms questions
// 3. we need to store the responses until submitting the form

// server comm
// 1. we probably need a serssion id
// 2. we need to submit the responses
</script>
