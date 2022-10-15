<template>
  <sup class="text-red-500">*{{ t("required") }}</sup>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
