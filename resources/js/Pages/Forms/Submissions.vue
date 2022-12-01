<template>
  <app-layout title="Submissions">
    <div class="w-full max-w-5xl px-4 pb-8 text-left">
      <div v-if="store.form" class="flex w-full items-end justify-between">
        <FormSummary
          class="mt-6"
          v-bind="{ form: store.form, blocks: store.blocks || undefined }"
        />
        <SubmissionActions v-bind="{ form }" />
      </div>

      <div
        class="mx-auto mt-4"
        v-if="
          store.form?.completed_sessions && store.form?.completed_sessions > 0
        "
      >
        <ScrollShadow direction="horizontal" class="relative overflow-x-auto">
          <div class="inline-block min-w-full py-4 align-middle">
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-grey-300">
                <thead class="bg-grey-100">
                  <tr class="divide-x divide-grey-200">
                    <th
                      scope="col"
                      class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
                    >
                      Submitted
                    </th>
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
                  <SubmissionTableItem
                    v-for="item in submissions?.data"
                    :key="item.id"
                    :submission="item"
                    :headers="submissionTableHeaders"
                  />
                </tbody>
              </table>
            </div>
          </div>
        </ScrollShadow>
      </div>
      <Pagination
        v-if="submissions && submissions.meta"
        :meta="submissions.meta"
        @next="nextPage"
        @previous="previousPage"
      />

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
import { callGetFormSubmissions } from "@/api/forms";
import striptags from "striptags";
import Pagination from "@/components/Pagination.vue";
import SubmissionTableItem from "@/components/Factory/Submissions/SubmissionTableItem.vue";
import SubmissionActions from "@/components/Factory/Submissions/SubmissionActions.vue";
import ScrollShadow from "@/components/ScrollShadow.vue";

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

store.$patch({
  form: props.form,
});
</script>
