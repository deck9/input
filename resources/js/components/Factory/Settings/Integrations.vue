<template>
  <form @submit="saveFormSubmitSettings">
    <div class="mb-4">
      <D9Label label="Integration Type" />
      <D9Select
        block
        :options="integrationTypes"
        disabledBadge="Planned"
        v-model="integrationMethod"
      />
    </div>
    <div class="mb-4">
      <D9Label label="Submit Method" />
      <D9Select block :options="submitTypes" v-model="submitMethod" />
    </div>
    <div class="mb-4">
      <D9Label label="Webhook / Submit URL" />
      <D9Input icon="external-link" type="url" block v-model="submitWebhook" />
    </div>

    <D9Button type="submit" label="Save Integration" :is-loading="isSaving" />
  </form>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Label, D9Input, D9Select, D9Button } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const integrationTypes = ref([
  { label: "Webhook", value: "webhook" },
  { label: "Make", value: "make", disabled: true },
  { label: "Zapier", value: "zapier", disabled: true },
]);

const integrationMethod = ref(integrationTypes.value[0]);

const submitTypes = ref([
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
]);

const submitMethod = ref(
  store.form?.submit_method
    ? submitTypes.value.find((i) => i.value === store.form?.submit_method)
    : submitTypes.value[0]
);
const submitWebhook = ref(store.form?.submit_webhook);

const saveFormSubmitSettings = async () => {
  isSaving.value = true;
  try {
    await store.updateForm({
      submit_method: submitMethod.value?.value,
      submit_webhook: submitWebhook.value,
    });
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};
</script>
