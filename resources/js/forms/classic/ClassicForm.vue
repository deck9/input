<template>
  <div class="mx-auto max-w-xl">
    <div class="py-4">
      <img class="h-12" :src="settings.avatar" :alt="settings.name" />
    </div>

    <Block v-if="store.currentBlock" :block="store.currentBlock" />
  </div>
</template>

<script lang="ts" setup>
import Block from "@/forms/classic/Block.vue";
import { useConversation } from "@/stores/conversation";

const props = defineProps<{
  settings: any;
}>();

const store = useConversation();
store.initForm(props.settings.uuid);
</script>
