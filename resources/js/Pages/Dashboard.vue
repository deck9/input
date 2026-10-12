<template>
  <app-layout title="Forms">
    <div class="w-full py-12">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-2xl font-bold leading-8 text-grey-900">Forms</h1>
          <CreateFormButton />
        </div>
        <!-- phones: search on one row, status and sort on the next -->
        <div
          class="mb-4 mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center"
        >
          <SearchField v-model="query" class="md:w-64 xl:w-72" />
          <div class="grid grid-cols-2 gap-2 md:contents">
            <FilterControl
              :status="status"
              :counts="counts"
              @changeStatus="changeStatus"
            />
            <SortControl
              class="md:ml-auto"
              :sort="sort"
              @changeSort="changeSort"
            />
          </div>
        </div>

        <div
          v-if="!statusForms.length"
          class="w-full rounded bg-white px-16 py-16 text-center"
        >
          <h2
            class="font-heading mb-4 text-center text-2xl font-black leading-none text-grey-900"
          >
            Start by creating a form
          </h2>
          <p class="text-sm text-grey-600">
            You haven't created a survey yet. Click on "New survey" in the top
            right corner to begin with a new survey. To get you started really
            quickly you can watch the following introduction for the BotReach
            editor.
          </p>
        </div>

        <div
          class="w-full rounded bg-white p-16 text-center"
          v-else-if="isLoading"
        >
          <D9Spinner label="Loading forms" />
        </div>

        <div v-else>
          <FormListTable :forms="visibleForms" />
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script lang="ts" setup>
import AppLayout from "@/Layouts/AppLayout.vue";
import FormListTable from "@/components/Dashboard/FormListTable.vue";
import CreateFormButton from "@/components/Dashboard/CreateFormButton.vue";
import FilterControl from "@/components/Dashboard/FilterControl.vue";
import SearchField from "@/components/Dashboard/SearchField.vue";
import SortControl from "@/components/Dashboard/SortControl.vue";

import { computed, ref, watch } from "vue";
import { callListForms } from "@/api/forms";
import { D9Spinner } from "@deck9/ui";

const apiSort: Record<SortSetting, string> = {
  latest: "latest_submission_at:desc",
  edited: "updated_at:desc",
  newest: "created_at:desc",
  name: "name:asc",
};
const statuses: StatusSetting[] = [
  "all",
  "published",
  "unpublished",
  "archived",
];

// unknown values in the URL fall back to the defaults
const params = new URLSearchParams(window.location.search);
const query = ref(params.get("q") ?? "");
const status = ref(
  statuses.find((value) => value === params.get("status")) ?? "all",
);
const sort = ref(
  (Object.keys(apiSort) as SortSetting[]).find(
    (value) => value === params.get("sort"),
  ) ?? "edited",
);

const isLoading = ref(true);
const forms = ref<Array<FormModel>>([]);
const archived = ref<Array<FormModel>>([]);

const counts = computed(() => {
  const published = forms.value.filter((form) => form.is_published).length;
  return {
    all: forms.value.length,
    published,
    unpublished: forms.value.length - published,
  };
});

const statusForms = computed(
  () =>
    ({
      all: forms.value,
      published: forms.value.filter((form) => form.is_published),
      unpublished: forms.value.filter((form) => !form.is_published),
      archived: archived.value,
    })[status.value],
);

// "muller" finds "Müller"
const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const visibleForms = computed(() => {
  const search = fold(query.value.trim());
  return statusForms.value.filter((form) => fold(form.name).includes(search));
});

// keeps Inertia's page state, so Back shows this page with the older URL
const writeUrl = (mode: "pushState" | "replaceState") => {
  const search = new URLSearchParams();
  if (query.value) search.set("q", query.value);
  if (status.value !== "all") search.set("status", status.value);
  if (sort.value !== "edited") search.set("sort", sort.value);

  const text = search.toString();
  const url = `${window.location.pathname}${text ? `?${text}` : ""}`;
  window.history[mode](window.history.state, "", url);
};

// typing replaces the history entry, so Back doesn't step through letters
watch(query, () => writeUrl("replaceState"));

// the archived forms load only when they're shown
const updateList = async (withForms = true) => {
  isLoading.value = true;
  try {
    const [all, trashed] = await Promise.all([
      withForms ? callListForms(null, apiSort[sort.value]) : null,
      status.value === "archived"
        ? callListForms("trashed", apiSort[sort.value])
        : null,
    ]);

    if (all) forms.value = all.data;
    if (trashed) archived.value = trashed.data;
  } catch (e) {
    console.warn(e);
  } finally {
    isLoading.value = false;
  }
};

const changeSort = (setting: SortSetting) => {
  sort.value = setting;
  writeUrl("pushState");
  updateList();
};

const changeStatus = (setting: StatusSetting) => {
  status.value = setting;
  writeUrl("pushState");
  if (setting === "archived") {
    updateList(false);
  }
};

// init forms on load
updateList();
</script>
