<template>
  <app-layout title="Forms">
    <div class="w-full py-12">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between gap-4">
          <h1 class="text-2xl font-bold leading-8 text-grey-900">Forms</h1>
          <CreateFormButton v-if="!isFirstRun" />
        </div>

        <section
          v-if="isFirstRun"
          aria-labelledby="first-run-title"
          class="mt-6 rounded-lg border border-grey-200 bg-white px-6 py-12 text-center sm:px-16"
        >
          <h2
            id="first-run-title"
            class="text-balance text-xl font-bold text-grey-900"
          >
            Create your first form
          </h2>
          <p class="mx-auto mt-2 max-w-md text-pretty text-sm text-grey-600">
            Build a form, share its link and read the answers here.
          </p>
          <CreateFormButton class="mt-6 justify-center" />
        </section>

        <template v-else>
          <!-- phones: search on one row, status and sort on the next -->
          <div
            class="mb-4 mt-6 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center"
          >
            <SearchField
              ref="searchField"
              v-model="query"
              class="md:w-64 xl:w-72"
            />
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

          <p role="status" class="sr-only">{{ announcement }}</p>

          <div
            v-if="hasFailed"
            role="alert"
            class="rounded-lg border border-grey-200 bg-white p-8 text-center"
          >
            <p class="text-sm font-medium text-grey-900">
              Couldn't load your forms.
            </p>
            <D9Button
              class="mt-4"
              color="light"
              label="Try again"
              :isLoading="isLoading"
              @click="updateList()"
            />
          </div>

          <!-- a refetch keeps the list, faded, until the new one is there -->
          <FormListTable
            v-else
            :forms="visibleForms"
            :aria-busy="isLoading"
            class="transition-opacity"
            :class="{ 'opacity-60': isLoading && statusForms }"
          >
            <div v-if="!statusForms">
              <span class="sr-only">Loading forms</span>
              <div
                v-for="row in 5"
                :key="row"
                aria-hidden="true"
                class="flex h-16 items-center border-b border-grey-200 px-4 last:border-0"
              >
                <D9Skeleton
                  avatar
                  :lines="0"
                  class="w-full text-grey-200 motion-reduce:animate-none sm:w-1/2"
                />
              </div>
            </div>
            <div v-else class="px-6 py-14 text-center">
              <p class="text-sm text-grey-600">{{ noMatch }}</p>
              <D9Button
                v-if="searchText"
                class="mt-4"
                color="light"
                label="Clear search"
                @click="clearSearch"
              />
              <D9Button
                v-else-if="status !== 'all'"
                class="mt-4"
                color="light"
                label="Show all forms"
                @click="showAll"
              />
            </div>
          </FormListTable>
        </template>
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

import { computed, reactive, ref, useTemplateRef, watch } from "vue";
import { callListForms } from "@/api/forms";
import { D9Button, D9Skeleton } from "@deck9/ui";

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
// an error belongs to the list that failed, so All still shows its forms
const failed = reactive({ forms: false, archived: false });
const hasFailed = computed(
  () => failed[status.value === "archived" ? "archived" : "forms"],
);
// null until loaded, so loading never looks like an empty list
const forms = ref<Array<FormModel> | null>(null);
const archived = ref<Array<FormModel> | null>(null);

const isFirstRun = computed(
  () => forms.value?.length === 0 && archived.value?.length === 0,
);

const counts = computed(() => {
  if (!forms.value) return undefined;

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
      published: forms.value?.filter((form) => form.is_published),
      unpublished: forms.value?.filter((form) => !form.is_published),
      archived: archived.value,
    })[status.value] ?? null,
);

// "muller" finds "Müller"
const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const searchText = computed(() => query.value.trim());

const visibleForms = computed(() => {
  const folded = fold(searchText.value);
  return (statusForms.value ?? []).filter((form) =>
    fold(form.name).includes(folded),
  );
});

const noMatch = computed(() => {
  const name = status.value === "all" ? "forms" : `${status.value} forms`;
  return searchText.value
    ? `No ${name} match "${searchText.value}".`
    : `No ${name}.`;
});

// read out while searching; an empty list says why
const announcement = computed(() => {
  const count = visibleForms.value.length;
  if (!statusForms.value || hasFailed.value) return "";
  if (!count) return noMatch.value;
  if (!searchText.value) return "";
  return count === 1 ? "1 form" : `${count.toLocaleString()} forms`;
});

// keeps Inertia's page state, so Back shows this page with the older URL
const writeUrl = (mode: "pushState" | "replaceState") => {
  const search = new URLSearchParams();
  if (query.value) search.set("q", query.value);
  if (status.value !== "all") search.set("status", status.value);
  if (sort.value !== "edited") search.set("sort", sort.value);

  const text = search.toString();
  const url = `${window.location.pathname}${text ? `?${text}` : ""}`;
  // Inertia reads this url when Back reloads the page
  const state = window.history.state && { ...window.history.state, url };
  window.history[mode](state, "", url);
};

// typing replaces the history entry, so Back doesn't step through letters
watch(query, () => writeUrl("replaceState"));

// only the latest request counts, so a slow older answer can't win
let latest = 0;

// the archived forms load only when they're shown
const updateList = async (withForms = true) => {
  const request = ++latest;
  const withArchived = status.value === "archived";
  const setFailed = (value: boolean) => {
    if (withForms) failed.forms = value;
    if (withArchived) failed.archived = value;
  };

  isLoading.value = true;
  try {
    const [all, trashed] = await Promise.all([
      withForms ? callListForms(null, apiSort[sort.value]) : null,
      withArchived ? callListForms("trashed", apiSort[sort.value]) : null,
    ]);

    // the first-run card needs to know there are no archived forms either
    const gone =
      all?.data.length === 0 && !trashed && !archived.value
        ? await callListForms("trashed", apiSort[sort.value])
        : trashed;
    if (request !== latest) return;

    if (all) forms.value = all.data;
    if (gone) archived.value = gone.data;
    setFailed(false);
  } catch (e) {
    console.warn(e);
    if (request === latest) setFailed(true);
  } finally {
    if (request === latest) isLoading.value = false;
  }
};

// picking the current value again adds no history entry
const changeSort = (setting: SortSetting) => {
  if (setting === sort.value) return;
  sort.value = setting;
  writeUrl("pushState");
  updateList();
};

const changeStatus = (setting: StatusSetting) => {
  if (setting === status.value) return;
  status.value = setting;
  writeUrl("pushState");
  // a newer request drops the running one, so it loads all forms again
  if (setting === "archived") {
    updateList(isLoading.value || !forms.value);
  }
};

// the clicked button goes away, so focus moves to the search
const searchField = useTemplateRef("searchField");

const clearSearch = () => {
  query.value = "";
  searchField.value?.focus();
};

const showAll = () => {
  changeStatus("all");
  searchField.value?.focus();
};

// init forms on load
updateList();
</script>
