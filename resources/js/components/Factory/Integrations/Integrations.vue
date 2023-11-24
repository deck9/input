<template>
  <div
    v-if="webhooks && webhooks.length > 0 && store.form"
    class="overflow-hidden border border-grey-200 bg-white sm:rounded-md"
  >
    <ul role="list" class="divide-y divide-grey-200">
      <IntegrationItem
        v-for="webhook in webhooks"
        :key="webhook.id"
        v-bind="{ webhook, form: store.form }"
        @edit="editIntegration"
      />
    </ul>
  </div>

  <EmptyState
    v-else
    :is-loading="isLoading"
    title="You have no webhooks configured"
    description="Setup your first webhook by clicking on the 'Add Integration' button"
  />

  <div class="mt-4">
    <D9Button type="button" label="Add Integration" @click="addIntegration" />
    <MakeButton />
    <span>Test</span>
    <span>Test</span>
    <span>Test</span>
  </div>

  <IntegrationEdit
    v-if="store.form"
    ref="editPanel"
    @updated="loadIntegrations"
    v-bind="{ form: store.form }"
  />
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button } from "@deck9/ui";
import { onMounted, ref } from "vue";
import { callGetformWebhooks } from "@/api/webhooks.js";
import EmptyState from "@/components/EmptyState.vue";
import IntegrationItem from "@/components/Factory/Integrations/IntegrationItem.vue";
import IntegrationEdit from "@/components/Factory/Integrations/IntegrationEdit.vue";
import MakeButton from "@/components/Factory/Integrations/MakeButton.vue";

const store = useForm();

const webhooks = ref<Array<FormWebhookModel>>([]);
const isLoading = ref(true);

const editPanel = ref<typeof IntegrationEdit | null>(null);

const addIntegration = () => {
  editPanel.value?.edit();
};

const editIntegration = (webhook: FormWebhookModel) => {
  editPanel.value?.edit(webhook);
};

const loadIntegrations = async () => {
  if (!store.form) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await callGetformWebhooks(store.form);
    webhooks.value = response.data;
  } catch (error) {
    console.warn(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadIntegrations();
});
</script>
