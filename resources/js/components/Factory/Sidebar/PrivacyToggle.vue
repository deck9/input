<template>
  <div class="flex items-center justify-end py-4">
    <span
      class="relative mr-4 flex items-center text-xs font-bold leading-none text-grey-900"
      :class="store.form?.has_data_privacy ? 'text-blue-500' : 'text-grey-900'"
    >
      <D9Icon name="user-shield" class="transition-lg mr-2" />GDPR Consent
    </span>
    <D9Switch label="Enable GDPR Consent" v-model="enabled" />
  </div>
</template>

<script setup lang="ts">
import { D9Icon, D9Switch } from "@deck9/ui";
import { ref, watch } from "vue";
import { useForm } from "@/stores";

const store = useForm();

const enabled = ref(store.form?.has_data_privacy ? true : false);

watch(enabled, async (change) => {
  await store.updateForm({ has_data_privacy: change });
  await store.getBlocks();
});
</script>
