<template>
  <div
    class="conversation-theme mx-auto flex h-full max-w-screen-sm flex-col justify-between py-8 px-4 md:px-0"
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
        <CompletionPage v-else-if="store.isSubmitted" />
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
        <a
          v-if="store.form?.privacy_link"
          :href="store.form?.privacy_link"
          target="_blank"
          >Privacy Policy</a
        >
        <a
          v-if="store.form?.legal_notice_link"
          :href="store.form?.legal_notice_link"
          target="_blank"
          >Legal Notice</a
        >
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import Block from "@/forms/classic/Block.vue";
import CompletionPage from "@/forms/classic/CompletionPage.vue";
import Navigator from "@/forms/classic/Navigator.vue";
import { useConversation } from "@/stores/conversation";
import { hyphenate } from "@vue/shared";
import { ref } from "vue";

const props = defineProps<{
  settings: PublicFormModel;
}>();

const store = useConversation();
store.initForm(props.settings);

function hexToRgb(hex) {
  const width = hex.length === 4 ? 1 : 2;
  const regex = new RegExp(
    `^#?([a-f\\d]{${width}})([a-f\\d]{${width}})([a-f\\d]{${width}})$`,
    "i"
  );
  const result = regex.exec(hex);

  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `${r}, ${g}, ${b}`;
  }

  return null;
}

const primaryColor = ref<string>(
  hexToRgb(store.form?.brand_color) ?? "37, 99, 235"
);
const contrastColor = ref<string>(
  hexToRgb(store.form?.contrast_color) ?? "255, 255, 255"
);
</script>

<style>
.conversation-theme {
  --color-primary: v-bind(primaryColor);
  --color-contrast: v-bind(contrastColor);
}
</style>
