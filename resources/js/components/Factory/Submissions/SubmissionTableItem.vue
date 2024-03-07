<template>
  <tr class="divide-x divide-grey-200">
    <td class="px-2 text-center">
      <D9Button
        class="whitespace-nowrap"
        color="danger"
        size="small"
        icon="trash"
        label="Delete"
        @click="deleteSubmission"
      />
    </td>
    <td
      class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-grey-900 sm:pl-6"
    >
      <div class="flex items-center">
        <button
          class="mr-2 inline-block font-mono font-bold active:text-blue-500"
          v-tooltip="'Copy Session ID'"
          @click="copySessionId"
        >
          {{ submission.uid.substring(0, 8) }}
        </button>
        <FormattedDate :date="submission.completed_at" />
      </div>
      <SubmissionParams
        v-if="submission.params"
        class="mt-1"
        v-bind="{ params: submission.params }"
      />
      <!-- Status for each Webhook Configured -->
      <div class="mt-1 flex space-x-2" v-if="submission.webhooks?.length > 0">
        <SubmissionWebhookStatus
          v-bind="{ webhook }"
          v-for="webhook in submission.webhooks"
          :key="webhook.id"
        />
      </div>
    </td>
    <td
      class="min-w-[200px] max-w-xs p-4 text-sm text-grey-500"
      v-for="header in headers"
      :key="submission.id + header.id"
    >
      <span class="flex flex-wrap gap-2" v-if="submission.responses[header.id]">
        <template
          v-for="response in submission.responses[header.id].data"
          :key="response.id"
        >
          <template v-if="response.type === 'input-file'">
            <a
              class="inline-block rounded bg-grey-100 px-2 py-1 hover:bg-grey-200"
              :href="upload.url"
              v-for="upload in response.original"
              :key="upload.uuid"
            >
              <span class="inline-block">{{ upload.name }}</span>
              <D9Icon class="ml-1" name="cloud-download" />
            </a>
          </template>
          <span class="inline-block rounded bg-grey-100 px-2 py-1" v-else>
            {{ response.value }}
          </span>
        </template>
      </span>
      <span v-else>-</span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import FormattedDate from "@/forms/common/LocaleDate.vue";
import SubmissionParams from "@/components/Factory/Submissions/SubmissionParams.vue";
import SubmissionWebhookStatus from "@/components/Factory/Submissions/SubmissionWebhookStatus.vue";
import { D9Button, D9Icon } from "@deck9/ui";
import { callDeleteFormSubmission } from "@/api/forms";
import { useForm } from "@/stores";
import { useClipboard } from "@vueuse/core";

const props = defineProps<{
  submission: Record<string, any>;
  headers?: {
    id: string;
    label: string;
  }[];
}>();

const emits = defineEmits<{
  (e: "deleted", id): void;
}>();

const store = useForm();

const { copy } = useClipboard();
const copySessionId = () => {
  try {
    copy(props.submission.uid);
  } catch (e) {
    console.warn("could not copy session id");
  }
};

const deleteSubmission = async () => {
  if (
    store.form &&
    confirm("Are you sure you want to delete this submission?")
  ) {
    try {
      await callDeleteFormSubmission(
        store.form,
        props.submission as FormSessionModel,
      );

      emits("deleted", props.submission.id);
    } catch (e) {
      console.error(e);
    }
  }
};
</script>
