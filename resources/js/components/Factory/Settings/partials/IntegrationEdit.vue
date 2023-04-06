<template>
  <TransitionRoot as="template" :show="open">
    <Dialog as="div" class="relative z-10" @close="close">
      <div class="fixed inset-0 bg-grey-900/25" />

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div
            class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
          >
            <TransitionChild
              as="template"
              enter="transform transition ease-out duration-200 sm:duration-400"
              enter-from="translate-x-full"
              enter-to="translate-x-0"
              leave="transform transition ease-in duration-200 sm:duration-300"
              leave-from="translate-x-0"
              leave-to="translate-x-full"
            >
              <DialogPanel class="pointer-events-auto w-screen max-w-lg">
                <form
                  @submit="saveIntegration"
                  class="flex h-full flex-col divide-y divide-grey-200 bg-white shadow-xl"
                >
                  <div
                    class="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6"
                  >
                    <div class="px-4 sm:px-6">
                      <div class="flex items-start justify-between">
                        <DialogTitle
                          class="text-base font-semibold leading-6 text-grey-900"
                        >
                          {{
                            webhook?.id ? "Edit Integration" : "Add Integration"
                          }}</DialogTitle
                        >
                        <div class="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            class="rounded-md bg-white px-2 text-grey-400 hover:text-grey-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            @click="close"
                          >
                            <span class="sr-only">Close panel</span>
                            <D9Icon name="close" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="relative mt-6 flex-1 px-4 sm:px-6">
                      <div class="mb-4">
                        <D9Label label="Name" />
                        <D9Input
                          type="text"
                          block
                          v-model="name"
                          placeholder="Name"
                        />
                      </div>
                      <div class="mb-4">
                        <D9Label label="Submit Method" />
                        <D9Select
                          block
                          :options="webhookRequestMethod"
                          v-model="webhookMethod"
                        />
                      </div>
                      <div class="mb-4">
                        <D9Label label="Webhook URL" />
                        <D9Input
                          icon="external-link"
                          type="url"
                          block
                          v-model="webhookUrl"
                          placeholder="https://"
                        />
                      </div>
                      <div class="mb-4">
                        <button
                          type="button"
                          class="text-sm text-red-500 underline"
                          @click="deleteIntegration"
                        >
                          Delete Integration
                        </button>
                      </div>
                    </div>
                  </div>
                  <div
                    class="flex flex-shrink-0 justify-end px-4 py-4"
                    :class="{ 'pointer-events-none opacity-50': isSaving }"
                  >
                    <D9Button
                      label="Cancel"
                      type="button"
                      @click="close"
                      color="light"
                    />
                    <D9Button
                      label="Save"
                      type="submit"
                      class="ml-4"
                      :is-loading="isSaving"
                    />
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import { D9Label, D9Input, D9Select, D9Button, D9Icon } from "@deck9/ui";
import {
  callCreateformWebhooks,
  callUpdateformWebhooks,
  callDeleteFormIntegration,
} from "@/api/webhooks.js";

const emits = defineEmits<{
  (e: "updated"): void;
}>();

const props = defineProps<{
  form: FormModel;
}>();

const webhook = ref<FormWebhookModel | null>(null);
const open = ref(false);
const isSaving = ref(false);

const webhookRequestMethod = ref([
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
]);

const name = ref("");
const webhookMethod = ref(webhookRequestMethod.value[0]);
const webhookUrl = ref("");

const edit = (payload?: FormWebhookModel) => {
  if (payload) {
    webhook.value = payload;

    name.value = payload.name;
    webhookUrl.value = payload.webhook_url;
    webhookMethod.value =
      webhookRequestMethod.value.find(
        (item) => item.value === payload.webhook_method
      ) ?? webhookRequestMethod.value[0];
  } else {
    webhook.value = null;
    name.value = "";
    webhookUrl.value = "";
    webhookMethod.value = webhookRequestMethod.value[0];
  }

  open.value = true;
};

const close = () => {
  open.value = false;
  webhook.value = null;
};

const deleteIntegration = () => {
  if (!webhook.value) return;

  if (!confirm("Are you sure you want to delete this webhook?")) return;

  isSaving.value = true;

  try {
    callDeleteFormIntegration(props.form, webhook.value);
    setTimeout(() => {
      emits("updated");
      close();
    }, 500);
    isSaving.value = false;
  } catch (e) {
    console.warn(e);
  }
};

const saveIntegration = async () => {
  isSaving.value = true;

  try {
    if (webhook.value && webhook.value.id) {
      await callUpdateformWebhooks(props.form, {
        ...webhook.value,
        name: name.value,
        webhook_method: webhookMethod.value?.value,
        webhook_url: webhookUrl.value,
        headers: {},
      });
    } else {
      await callCreateformWebhooks(props.form, {
        name: name.value,
        webhook_method: webhookMethod.value?.value,
        webhook_url: webhookUrl.value,
        headers: {},
      });
    }

    emits("updated");

    setTimeout(() => {
      close();
      isSaving.value = false;
    }, 500);
  } catch (e) {
    console.error(e);
    isSaving.value = false;
  }
};

defineExpose({ edit });
</script>
