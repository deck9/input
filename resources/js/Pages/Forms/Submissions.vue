<template>
  <app-layout title="Submissions">
    <div class="w-full px-4 pb-8 text-left sm:px-6 lg:px-8">
      <div v-if="store.form" class="mt-8 flex w-full items-end justify-between">
        <div class="flex gap-x-2">
          <D9Button
            label="Submissions"
            @click="viewMode = 'submissions'"
            :color="viewMode === 'submissions' ? 'primary' : 'light'"
          />
          <D9Button
            label="Summary"
            @click="viewMode = 'summary'"
            :color="viewMode === 'summary' ? 'primary' : 'light'"
          />
        </div>
        <SubmissionActions v-bind="{ form }" />
      </div>

      <div
        class="mt-4"
        v-if="
          store.form?.completed_sessions && store.form?.completed_sessions > 0
        "
      >
        <SubmissionsTable v-if="viewMode === 'submissions'" v-bind="{ form }" />
        <SubmissionsSummary
          v-else-if="viewMode === 'summary'"
          v-bind="{ form }"
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
import { D9Button } from "@deck9/ui";
import { useForm } from "@/stores";
import { onMounted, onBeforeUnmount, ref } from "vue";
import EmptyState from "@/components/EmptyState.vue";
import SubmissionsTable from "@/components/Factory/Submissions/SubmissionsTable.vue";
import SubmissionsSummary from "@/components/Factory/Submissions/SubmissionsSummary.vue";
import SubmissionActions from "@/components/Factory/Submissions/SubmissionActions.vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

const viewMode = ref<"submissions" | "summary">("submissions");

onBeforeUnmount(() => {
  store.clearForm();
});

onMounted(async () => {
  await Promise.all([store.getBlocks(true), store.getFormBlockMapping()]);
});

store.$patch({
  form: props.form,
});
</script>
