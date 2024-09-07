<template>
  <ScrollShadow direction="horizontal" class="relative overflow-x-auto">
    <div class="inline-block min-w-full py-4 align-middle">
      <div
        class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
      >
        <table class="min-w-full divide-y divide-grey-300">
          <thead class="bg-grey-100">
            <tr class="divide-x divide-grey-200">
              <th scope="col" class="px-2"></th>
              <th
                scope="col"
                class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
              >
                Session Info
              </th>
              <th
                scope="col"
                class="px-4 py-3.5 text-left text-sm font-semibold text-grey-900"
                v-for="header in submissionTableHeaders"
                :key="header.id"
              >
                <div class="text-pretty line-clamp-5" :alt="header.label">
                  {{ header.label }}
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-200 bg-white">
            <SubmissionTableItem
              v-for="item in submissions?.data"
              :key="item.id"
              :submission="item"
              :headers="submissionTableHeaders"
              @deleted="removeItem"
            />
          </tbody>
        </table>
      </div>
    </div>
  </ScrollShadow>

  <Pagination
    v-if="submissions && submissions.meta"
    :meta="submissions.meta"
    @next="nextPage"
    @previous="previousPage"
  />
</template>

<script lang="ts" setup>
import Pagination from "@/components/Pagination.vue";
import SubmissionTableItem from "@/components/Factory/Submissions/SubmissionTableItem.vue";
import ScrollShadow from "@/components/ScrollShadow.vue";
import striptags from "striptags";
import { useForm } from "@/stores";
import { computed, onMounted, ref } from "vue";
import { callGetFormSubmissions } from "@/api/forms";

const store = useForm();

const props = defineProps<{
  form: FormModel;
}>();

const submissions = ref<null | PaginatedResponse<Record<string, any>>>(null);
const getSubmissions = async (page) => {
  submissions.value = await callGetFormSubmissions(props.form, page);
};

const removeItem = (sessionId) => {
  // modify the submissions array to remove the deleted item
  if (submissions.value) {
    submissions.value.data = submissions.value.data.filter(
      (item) => item.id !== sessionId,
    );
  }
};

onMounted(async () => {
  await getSubmissions(1);
});

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
  const headers = store.blocks
    ?.filter((block) => !["group", "none"].includes(block.type))
    .map((block) => {
      return {
        id: block.uuid,
        label: block.title ?? striptags(block.message ?? ""),
      };
    });

  return headers;
});
</script>
