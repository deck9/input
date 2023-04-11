<template>
  <li>
    <div>
      <div class="flex items-center px-4 py-4 sm:px-6">
        <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
          <div class="truncate">
            <div class="flex text-sm">
              <p class="truncate font-medium text-blue-600">
                {{ webhook.name }}
              </p>
            </div>
            <div class="mt-2 flex">
              <div class="flex items-center text-sm text-grey-500">
                <Label class="flex-shrink-0" color="grey">{{
                  webhook.webhook_method
                }}</Label>
                <p class="ml-1">
                  {{ webhook.webhook_url }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 flex-shrink-0 sm:ml-5 sm:mt-0"></div>
        </div>
        <div class="mt-px">
          <D9Switch
            v-model="isIntegrationEnabled"
            @change="updateIntegration"
          />
        </div>
        <button class="ml-5 flex-shrink-0 px-1" @click="editIntegration">
          <D9Icon name="cog" class="text-grey-400" aria-hidden="true" />
        </button>
      </div>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { D9Icon, D9Switch } from "@deck9/ui";
import Label from "@/components/Label.vue";
import { ref } from "vue";
import { callUpdateformWebhooks } from "@/api/webhooks.js";

const props = defineProps<{
  webhook: FormWebhookModel;
  form: FormModel;
}>();

const emits = defineEmits<{
  (event: "edit", payload: FormWebhookModel): void;
}>();

const isIntegrationEnabled = ref(props.webhook.is_enabled);

const updateIntegration = async () => {
  await callUpdateformWebhooks(props.form, {
    ...props.webhook,
    is_enabled: isIntegrationEnabled.value,
  });
};

const editIntegration = () => {
  emits("edit", props.webhook);
};
</script>
