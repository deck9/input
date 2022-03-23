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
      <transition
        mode="out-in"
        enter-from-class="opacity-0 translate-y-4"
        enter-active-class="transition duration-300 ease-out"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="opacity-0 -translate-y-10"
      >
        <Block
          v-if="store.currentBlock"
          :block="store.currentBlock"
          :key="store.currentBlock.id"
        />
      </transition>
    </div>

    <footer class="flex justify-between text-center text-xs">
      <Navigator
        :current-page="store.current + 1"
        @prev="store.back()"
        @next="store.next()"
      />
      <div class="space-x-4">
        <a href="">Privacy Policy</a>
        <a href="">Legal Notice</a>
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
