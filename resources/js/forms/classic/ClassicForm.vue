<template>
  <div
    class="conversation-theme flex min-h-full max-w-screen-sm flex-col justify-between"
    :class="{
      'mx-auto': !flags.alignLeft,
    }"
  >
    <div>
      <Header v-if="!flags.hideTitle" :form="store.form" />

      <div class="h-full w-full max-w-screen-sm py-10">
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
          <FormSubmittedPage v-else-if="store.isSubmitted" />
        </transition>
      </div>
    </div>

    <footer class="flex items-center justify-between text-center text-xs">
      <Navigator
        v-bind="{
          hideNavigation: flags.hideNavigation,
          block: store.currentBlock,
        }"
        :key="store.currentBlock?.id ?? 'navigator'"
        :class="{
          'pointer-events-none opacity-0': store.isSubmitted,
        }"
      />

      <FooterNavigation :form="store.form" />
    </footer>
  </div>
</template>

<script lang="ts" setup>
import Header from "@/forms/classic/layout/Header.vue";
import Block from "@/forms/classic/layout/Block.vue";
import FormSubmittedPage from "@/forms/classic/layout/FormSubmittedPage.vue";
import Navigator from "@/forms/classic/layout/Navigator.vue";
import FooterNavigation from "@/forms/classic/layout/FooterNavigation.vue";
import { useConversation } from "@/stores/conversation";
import { useThemableColor } from "@/utils/useThemableColor";
import { useBeforeUnload } from "@/utils/useBeforeUnload";
import { computed, onMounted, provide, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { useRouteParams } from "@/utils/useRouteParams";

const props = defineProps<{
  settings: PublicFormModel;
  flags: EmbedFlags;
}>();

const isLoading = ref(true);
const focusDisabled = computed(() => {
  return isLoading.value && !props.flags.autofocus;
});
provide("disableFocus", focusDisabled);

const store = useConversation();
await store.initForm(
  props.settings,
  useRouteParams([
    "iframe",
    "hideTitle",
    "hideNavigation",
    "focusOnMount",
    "alignLeft",
  ])
);

const { locale } = useI18n({ useScope: "global" });
locale.value = store.form?.language ?? "en";

const { hasUnsavedPayload } = storeToRefs(store);

onMounted(() => {
  isLoading.value = false;

  useBeforeUnload(hasUnsavedPayload);
});

const primaryColor = useThemableColor(store.form?.brand_color ?? "#1f2937");
const contrastColor = useThemableColor(store.form?.contrast_color ?? "#f9fafb");
</script>

<style>
.conversation-theme {
  --color-primary: v-bind(primaryColor);
  --color-contrast: v-bind(contrastColor);
}
</style>
