<template>
  <div>
    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Name" />
        <D9Input type="text" v-model="name" block />
      </div>

      <div class="mb-4">
        <D9Label label="Description" />
        <D9Textarea v-model="description" block />
      </div>

      <div class="mb-4">
        <D9Label label="Form Language" />
        <D9Select v-model="language" :options="languageOptions" />
      </div>

      <div class="mb-4 flex justify-between">
        <D9Label label="Send email notifications" />
        <D9Switch
          label=""
          v-model="isNotificationViaMail"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <D9Button type="submit" label="Save Options" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import {
  D9Button,
  D9Label,
  D9Input,
  D9Textarea,
  D9Select,
  D9Switch,
} from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const name = ref(store?.form?.name);
const description = ref(store?.form?.description);
const isNotificationViaMail = ref(store?.form?.is_notification_via_mail);

const languageOptions = ref([
  // Default language
  { label: "English", value: "en" },

  // Alternative languages
  { label: "Français", value: "fr" },
  { label: "German", value: "de" },
  { label: "Norwegian", value: "no" },
  { label: "Polish", value: "pl" },
  { label: "Slovak", value: "sk" },
  { label: "简体中文", value: "zh-CN"},
]);

const language = ref(
  languageOptions.value.find((lang) => lang.value === store?.form?.language) ??
    languageOptions.value[0]
);

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    name: name.value,
    description: description.value,
    language: language.value.value,
    is_notification_via_mail: isNotificationViaMail.value,
  });

  isSaving.value = false;
};
</script>
