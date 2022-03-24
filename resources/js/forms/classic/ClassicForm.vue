<template>
  <div
    class="mx-auto flex h-full max-w-screen-sm flex-col justify-between py-8 px-4 md:px-0"
  >
    <div class="py-4">
      <img
        v-if="settings.avatar"
        class="h-12 w-auto object-contain"
        :src="settings.avatar"
        :alt="settings.name"
      />
    </div>

    <div class="mx-auto h-full w-full max-w-screen-sm pt-10 pb-12 md:pt-[16vh]">
      <transition
        mode="out-in"
        enter-from-class="opacity-0 translate-y-4"
        enter-active-class="transition duration-300 ease-out"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-to-class="opacity-0 -translate-y-10"
      >
        <Block
          v-if="store.currentBlock && !store.isSubmitted"
          :block="store.currentBlock"
          :key="store.currentBlock.id"
        />
        <div v-else-if="store.isSubmitted">
          <h2 class="text-lg font-medium">Form submitted</h2>
          <p class="mt-2 text-base leading-6">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa,
            aspernatur placeat. Exercitationem ab molestias saepe nihil
            blanditiis, et odio qui, eveniet maiores, id eos eum sed! Illum
            laborum molestias dignissimos.
          </p>
          <pre class="mt-4 rounded bg-black px-4 py-4 text-xs text-green-600"
            >{{ JSON.stringify(store.payload) }} </pre
          >
          <CallToActionButton label="Close" />
        </div>
      </transition>
    </div>

    <footer class="flex justify-between text-center text-xs">
      <Navigator
        :class="{ 'pointer-events-none opacity-50': store.isSubmitted }"
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
import CallToActionButton from "./CallToActionButton.vue";
import { useConversation } from "@/stores/conversation";

const props = defineProps<{
  settings: any;
}>();

const store = useConversation();
store.initForm(props.settings.uuid);
</script>
