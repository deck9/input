<template>
  <div class="space-x-4 text-content/80">
    <a
      class="hover:text-content"
      v-if="isAllowedLink(form?.privacy_link)"
      :href="form?.privacy_link"
      target="_blank"
      >{{ t("privacy_policy") }}</a
    >
    <a
      class="hover:text-content"
      v-if="isAllowedLink(form?.legal_notice_link)"
      :href="form?.legal_notice_link"
      target="_blank"
      >{{ t("legal_notice") }}</a
    >
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { isAllowedLink } from "@/utils/sanitize";
const { t } = useI18n();

defineProps<{
  form?: PublicFormModel;
}>();
</script>
