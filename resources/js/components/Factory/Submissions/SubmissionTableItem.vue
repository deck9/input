<template>
  <tr class="divide-x divide-grey-200">
    <td class="px-2">
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
      <FormattedDate :date="submission.completed_at" />
    </td>
    <td class="whitespace-nowrap p-4 text-sm text-grey-500">
      {{ submission.uid }}
    </td>
    <td class="max-w-[200px] p-4 text-sm text-grey-500">
      <SubmissionParams v-bind="{ params: submission.params }" />
    </td>
    <td
      class="min-w-[200px] max-w-xs p-4 text-sm text-grey-500"
      v-for="header in headers"
      :key="submission.id + header.id"
    >
      <span
        class="block"
        v-for="response in submission.responses.filter(
          (r) => r.id === header.id
        )"
        :key="response.value"
      >
        {{ response.value }}
      </span>
    </td>
  </tr>
</template>

<script lang="ts" setup>
import FormattedDate from "@/forms/common/LocaleDate.vue";
import SubmissionParams from "@/components/Factory/Submissions/SubmissionParams.vue";
import { D9Button } from "@deck9/ui";
import { callDeleteFormSubmission } from "@/api/forms";
import { useForm } from "@/stores";

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

const deleteSubmission = async () => {
  if (
    store.form &&
    confirm("Are you sure you want to delete this submission?")
  ) {
    try {
      await callDeleteFormSubmission(
        store.form,
        props.submission as FormSessionModel
      );

      emits("deleted", props.submission.id);
    } catch (e) {
      console.error(e);
    }
  }
};
</script>
