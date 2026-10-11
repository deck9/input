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
        <D9Label id="form-language" label="Form Language" />
        <D9Select
          id="form-language"
          v-model="language"
          :options="languageOptions"
        />
      </div>

      <div class="mb-4 flex justify-between">
        <D9Label id="notification-via-mail" label="Send email notifications" />
        <D9Switch
          id="notification-via-mail"
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
import { useNotice } from "@/stores/notice";

const store = useForm();
const notice = useNotice();
const isSaving = ref(false);

const name = ref(store?.form?.name);
const description = ref(store?.form?.description);
const isNotificationViaMail = ref(
  store?.form?.is_notification_via_mail ?? false,
);

const languageOptions = ref([
  // Default language
  { id: "en", label: "English", value: "en" },

  // Alternative languages
  { id: "fr", label: "Français", value: "fr" },
  { id: "de", label: "German", value: "de" },
  { id: "no", label: "Norwegian", value: "no" },
  { id: "pl", label: "Polish", value: "pl" },
  { id: "uk", label: "Ukrainian", value: "uk" },
  { id: "sk", label: "Slovak", value: "sk" },
  { id: "zh", label: "简体中文", value: "zh" },
]);

const language = ref(
  languageOptions.value.find((lang) => lang.value === store?.form?.language) ??
    languageOptions.value[0],
);

const saveOptions = async () => {
  isSaving.value = true;

  try {
    await store.updateForm({
      name: name.value,
      description: description.value,
      language: language.value.value,
      is_notification_via_mail: isNotificationViaMail.value,
    });
    notice.clearSaveError("updateForm:options");
  } catch (error) {
    notice.showSaveError(error, "updateForm:options");
  }

  isSaving.value = false;
};
</script>
