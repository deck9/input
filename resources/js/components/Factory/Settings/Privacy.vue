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

      <D9Button type="submit" label="Save Privacy" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const privacyLink = ref(store?.form?.privacy_link);
const legalNoticeLink = ref(store?.form?.legal_notice_link);

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    privacy_link: privacyLink.value,
    legal_notice_link: legalNoticeLink.value,
  });

  isSaving.value = false;
};
</script>
