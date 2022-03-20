<template>
  <div
    class="mx-auto flex h-full max-w-2xl flex-col justify-between py-8 px-4 md:px-0"
  >
    <div class="py-4">
      <img
        v-if="settings.avatar"
        class="h-12 w-auto object-contain"
        :src="settings.avatar"
        :alt="settings.name"
      />
    </div>

    <div class="h-full pt-10 pb-12 md:pt-[16vh]">
      <Block v-if="store.currentBlock" :block="store.currentBlock" />
    </div>

    <footer class="space-x-2 text-center text-xs">
      <a href="">Privacy Policy</a>
      <a href="">Legal Notice</a>
    </footer>
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
