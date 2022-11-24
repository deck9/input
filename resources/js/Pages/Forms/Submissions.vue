<template>
  <app-layout title="Submissions">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div v-if="store.form" class="flex w-full items-end justify-between">
        <FormSummary
          class="mt-6"
          v-bind="{ form: store.form, blocks: store.blocks || undefined }"
        />
        <div class="space-x-2">
          <D9Button
            label="Purge Submissions"
            icon="trash"
            color="light"
            @click="purgeSubmissions"
          />
          <D9Button
            label="Download Submissions"
            icon="cloud-download"
            color="dark"
            @click="downloadSubmissionsExport"
          />
        </div>
      </div>

      <div
        class="mx-auto mt-4"
        v-if="
          store.form?.completed_sessions && store.form?.completed_sessions > 0
        "
      >
        <div
          class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
        >
          <table class="min-w-full divide-y divide-grey-300">
            <thead class="bg-grey-100">
              <tr class="divide-x divide-grey-200">
                <th
                  scope="col"
                  class="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-grey-900 sm:pl-6"
                >
                  ID
                </th>
                <th
                  scope="col"
                  class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
                >
                  Submitted
                </th>
                <th
                  scope="col"
                  class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
                >
                  Params
                </th>
                <th
                  scope="col"
                  class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
                  v-for="header in submissionTableHeaders"
                  :key="header.id"
                >
                  {{ header.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-grey-200 bg-white">
              <tr
                v-for="item in submissions?.data"
                :key="item.id"
                class="divide-x divide-grey-200"
              >
                <td
                  class="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-grey-900 sm:pl-6"
                >
                  {{ item.id }}
                </td>
                <td class="whitespace-nowrap p-4 text-sm text-grey-500">
                  {{ item.completed_at }}
                </td>
                <td class="whitespace-nowrap p-4 text-sm text-grey-500">
                  {{ item.params ?? "-" }}
                </td>
                <td
                  class="whitespace-nowrap p-4 text-sm text-grey-500"
                  v-for="header in submissionTableHeaders"
                  :key="item.id + header.id"
                >
                  {{
                    item.responses.find((r) => r.name === header.id)?.value ??
                    "-"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Pagination
          v-if="submissions && submissions.meta"
          :meta="submissions.meta"
          @next="nextPage"
          @previous="previousPage"
        />
      </div>

      <EmptyState
        class="mt-6"
        v-else
        title="No results found"
        description="There are no results to show right now"
      />
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { useForm } from "@/stores";
import { computed, onMounted, onUnmounted, ref } from "vue";
import FormSummary from "@/components/Factory/FormSummary.vue";
import EmptyState from "@/components/EmptyState.vue";
import { D9Button } from "@deck9/ui";
import { callGetFormSubmissions, callPurgeSubmissions } from "@/api/forms";
import striptags from "striptags";
import Pagination from "@/components/Pagination.vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();
const submissions = ref<null | PaginatedResponse<Record<string, any>>>(null);

onUnmounted(() => {
  store.clearForm();
});

onMounted(async () => {
  await Promise.all([store.getBlocks(true), store.getFormBlockMapping()]);
  getSubmissions(1);
});

const getSubmissions = async (page) => {
  submissions.value = await callGetFormSubmissions(props.form, page);
};

const nextPage = () => {
  if (
    submissions.value &&
    submissions.value.meta.current_page < submissions.value.meta.last_page
  ) {
    getSubmissions(submissions.value.meta.current_page + 1);
  }
};

const previousPage = () => {
  if (submissions.value && submissions.value.meta.current_page > 1) {
    getSubmissions(submissions.value.meta.current_page - 1);
  }
};

const submissionTableHeaders = computed(() => {
  const headers = store.blocks?.map((block) => {
    return {
      id: block.uuid,
      label: block.title ?? striptags(block.message ?? ""),
    };
  });

  return headers;
});

const downloadSubmissionsExport = () => {
  window
    .open(
      window.route("forms.submissions-export", { form: props.form.uuid }),
      "_blank"
    )
    ?.focus();
};

const purgeSubmissions = async () => {
  let confirm = window.confirm(
    "Are you sure you want to delete all collected data for this form? This actions is not reversible"
  );

  if (confirm) {
    await callPurgeSubmissions(props.form);
    await store.refreshForm(true);
  }
};

store.$patch({
  form: props.form,
});
</script>
