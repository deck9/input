<template>
  <div class="space-x-4">
    <a v-if="form?.privacy_link" :href="form?.privacy_link" target="_blank"
      >Privacy Policy</a
    >
    <a
      v-if="form?.legal_notice_link"
      :href="form?.legal_notice_link"
      target="_blank"
      >Legal Notice</a
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form?: PublicFormModel;
}>();
</script>
