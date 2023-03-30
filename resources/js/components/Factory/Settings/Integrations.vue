<template>
  <div
    v-if="integrations && integrations.length > 0 && store.form"
    class="overflow-hidden border border-grey-200 bg-white sm:rounded-md"
  >
    <ul role="list" class="divide-y divide-grey-200">
      <IntegrationItem
        v-for="integration in integrations"
        :key="integration.id"
        v-bind="{ integration, form: store.form }"
        @edit="editIntegration"
      />
    </ul>
  </div>

  <EmptyState
    v-else
    :is-loading="isLoading"
    title="You have no integrations configured"
    description="Setup your first integration by clicking on the 'Add Integration' button"
  />

  <div class="mt-4">
    <D9Button type="button" label="Add Integration" @click="addIntegration" />
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
import IntegrationItem from "@/components/Factory/Settings/partials/IntegrationItem.vue";
import { onMounted, ref } from "vue";
import { callGetFormIntegrations } from "@/api/integrations";
import EmptyState from "@/components/EmptyState.vue";
import IntegrationEdit from "@/components/Factory/Settings/partials/IntegrationEdit.vue";

const store = useForm();

const integrations = ref<Array<FormIntegrationModel>>([]);
const isLoading = ref(true);

const editPanel = ref<typeof IntegrationEdit | null>(null);

const addIntegration = () => {
  editPanel.value?.edit();
};

const editIntegration = (integration: FormIntegrationModel) => {
  editPanel.value?.edit(integration);
};

const loadIntegrations = async () => {
  if (!store.form) {
    return;
  }

  isLoading.value = true;

  try {
    const response = await callGetFormIntegrations(store.form);
    integrations.value = response.data;
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
