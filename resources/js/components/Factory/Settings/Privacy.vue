<template>
  <div>
    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Privacy Link" />
        <D9Input type="url" v-model="privacyLink" block />
      </div>

      <div class="mb-4">
        <D9Label label="Legal Notice Link" />
        <D9Input type="url" v-model="legalNoticeLink" block />
      </div>

      <div class="mb-4 flex justify-between">
        <D9Label label="Auto Delete Submissions" />
        <D9Switch
          label=""
          v-model="isAutoDeleteEnabled"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <div class="mb-4">
        <D9Label label="Data retention in days" />
        <D9Input type="number" min="1" v-model="dataRetentionDays" block />
      </div>

      <ValidationErrors
        class="mb-2"
        v-if="errors.length > 0"
        :errors="errors"
      />

      <D9Button type="submit" label="Save Privacy" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input, D9Switch } from "@deck9/ui";
import { ref } from "vue";

import ValidationErrors from "@/components/ValidationErrors.vue";
import { AxiosError } from "axios";

const store = useForm();
const isSaving = ref(false);

const errors = ref<string[]>([]);

const privacyLink = ref(store?.form?.privacy_link);
const legalNoticeLink = ref(store?.form?.legal_notice_link);

const isAutoDeleteEnabled = ref(store?.form?.is_auto_delete_enabled);
const dataRetentionDays = ref(store?.form?.data_retention_days);

const saveOptions = async () => {
  isSaving.value = true;
  errors.value = [];

  try {
    await store.updateForm({
      privacy_link: privacyLink.value,
      legal_notice_link: legalNoticeLink.value,
      is_auto_delete_enabled: isAutoDeleteEnabled.value,
      data_retention_days: dataRetentionDays.value,
    });
  } catch (error: any) {
    if (error instanceof AxiosError) {
      errors.value = [error.response?.data?.message || "Unknown error"];
    } else {
      console.warn("Could not save privacy options", error);
    }
  }

  isSaving.value = false;
};
</script>
