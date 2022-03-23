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

    <div class="mx-auto h-full w-full max-w-md pt-10 pb-12 md:pt-[16vh]">
      <Block
        v-if="store.currentBlock"
        :block="store.currentBlock"
        :key="store.currentBlock.id"
      />
    </div>

    <footer class="space-x-2 text-center text-xs">
      <Navigator
        :current-page="store.current + 1"
        @prev="store.back()"
        @next="store.next()"
      />

      <a href="">Privacy Policy</a>
      <a href="">Legal Notice</a>
      <div
        class="fixed right-0 bottom-0 mt-4 w-64 rounded bg-black py-2 px-4 text-left text-xs text-yellow-600"
      >
        <pre>current: {{ store.current }}</pre>
        <pre>isLastBlock: {{ store.isLastBlock }}</pre>
        <pre>{{ store.payload }}</pre>
        <pre>{{ store.currentBlock }}</pre>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import Block from "@/forms/classic/Block.vue";
import Navigator from "@/forms/classic/Navigator.vue";
import { useConversation } from "@/stores/conversation";

const props = defineProps<{
  settings: any;
}>();

const store = useConversation();
store.initForm(props.settings.uuid);
</script>
