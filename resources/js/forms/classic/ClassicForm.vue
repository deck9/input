<template>
  <div class="mx-auto max-w-xl">
    <div class="py-4">
      <img class="h-12" :src="settings.avatar" :alt="settings.name" />
    </div>

    <form
      class="mt-10 h-full"
      v-if="store.currentBlock"
      @submit.prevent="store.next"
    >
      <div class="prose" v-html="store.currentBlock.message"></div>

      <div class="mt-6">
        <div
          class="mb-2"
          v-for="action in store.currentBlock.interactions"
          :key="action.id"
        >
          {{ action.label }}
        </div>
      </div>

      <button
        type="submit"
        class="mt-4 rounded bg-black px-2 py-1 font-medium text-white"
      >
        Next
      </button>
    </form>

    <div class="hidden bg-grey-900 px-8 py-6 font-mono text-xs text-grey-400">
      <pre>{{ settings }}</pre>
      {{ store.currentBlock }}
    </div>
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
