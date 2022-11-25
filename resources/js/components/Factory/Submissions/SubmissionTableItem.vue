<template>
  <tr class="divide-x divide-grey-200">
    <td
      class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-grey-900 sm:pl-6"
    >
      <FormattedDate :date="submission.completed_at" />
    </td>
    <td class="whitespace-nowrap p-4 text-sm text-grey-500">
      {{ submission.id }}
    </td>
    <td class="whitespace-nowrap p-4 text-sm text-grey-500">
      {{ submission.params ?? "-" }}
    </td>
    <td
      class="min-w-[200px] max-w-xs p-4 text-sm text-grey-500"
      v-for="header in headers"
      :key="submission.id + header.id"
    >
      <span
        class="block"
        v-for="response in submission.responses.filter(
          (r) => r.name === header.id
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

defineProps<{
  submission: Record<string, any>;
  headers?: {
    id: string;
    label: string;
  }[];
}>();
</script>
