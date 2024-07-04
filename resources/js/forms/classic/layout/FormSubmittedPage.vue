<template>
  <div>
    <h2 class="text-lg font-medium">
      {{ store.form?.eoc_headline || t("form_submitted") }}
    </h2>
    <p v-if="store.form?.eoc_text" class="mt-2 text-base leading-6">
      {{ store.form?.eoc_text }}
    </p>
    <CallToActionButton
      v-if="store.form?.show_cta_link && store.callToActionUrl"
      :href="store.callToActionUrl"
      :label="store.form?.cta_label ?? t('close')"
    />

    <SocialLinks v-if="store.form?.show_social_links" class="mt-8" />
  </div>
</template>

<script lang="ts" setup>
import CallToActionButton from "./CallToActionButton.vue";
import { useConversation } from "@/stores/conversation";
import SocialLinks from "@/forms/classic/layout/SocialLinks.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const store = useConversation();
</script>
