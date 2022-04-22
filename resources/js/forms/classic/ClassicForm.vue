<template>
  <div
    class="conversation-theme mx-auto flex h-full max-w-screen-sm flex-col justify-between py-8 px-4 md:px-0"
  >
    <Header :form="store.form" />

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
        <FormSubmitSettings v-else-if="store.isSubmitted" />
      </transition>
    </div>

    <footer class="flex justify-between text-center text-xs">
      <Navigator />
      <FooterNavigation :form="store.form" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import Header from "@/forms/classic/layout/Header.vue";
import Block from "@/forms/classic/layout/Block.vue";
import FormSubmitSettings from "@/forms/classic/layout/FormSubmitSettings.vue";
import Navigator from "@/forms/classic/layout/Navigator.vue";
import FooterNavigation from "@/forms/classic/layout/FooterNavigation.vue";
import { useConversation } from "@/stores/conversation";
import { useThemableColor } from "@/utils/useThemableColor";

const props = defineProps<{
  settings: PublicFormModel;
}>();

const store = useConversation();
store.initForm(props.settings);

const primaryColor = useThemableColor(store.form?.brand_color ?? "#1f2937");
const contrastColor = useThemableColor(store.form?.contrast_color ?? "#f9fafb");
</script>

<style>
.conversation-theme {
  --color-primary: v-bind(primaryColor);
  --color-contrast: v-bind(contrastColor);
}
</style>
