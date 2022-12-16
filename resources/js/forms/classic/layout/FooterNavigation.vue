<template>
  <div class="space-x-4 text-content/80">
    <a
      class="hover:text-content"
      v-if="form?.privacy_link"
      :href="form?.privacy_link"
      target="_blank"
      >{{ t("Privacy Policy") }}</a
    >
    <a
      class="hover:text-content"
      v-if="form?.legal_notice_link"
      :href="form?.legal_notice_link"
      target="_blank"
      >{{ t("Legal Notice") }}</a
    >
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();

defineProps<{
  form?: PublicFormModel;
}>();
</script>
