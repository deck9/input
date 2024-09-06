<template>
  <app-layout
    :title="'Dashboard for ' + $page.props.auth.user.current_team.name"
  >
    <div class="w-full py-12">
      <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div class="col-span-12 lg:col-span-8">
          <div class="relative mb-6 flex items-center justify-between">
            <h2 class="text-xl font-bold leading-8 text-grey-900 shrink-0">
              Your Forms
            </h2>
            <div class="flex justify-end w-full space-x-2">
              <SortControl :sort="sort" @changeSort="changeSort" />
              <FilterControl :filter="filter" @changeFilter="changeFilter" />
              <CreateFormButton />
            </div>
          </div>

          <div
            v-if="!forms.length || forms.length === 0"
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
            <D9Spinner />
          </div>

          <div v-else>
            <FormListTable :forms="forms" />
          </div>
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
import SortControl from "@/components/Dashboard/SortControl.vue";

import { ref } from "vue";
import { callListForms } from "@/api/forms";
import { D9Spinner } from "@deck9/ui";
import { useUrlSearchParams } from "@vueuse/core";

const params = useUrlSearchParams("history");

const isLoading = ref(true);
const forms = ref<Array<FormModel>>([]);
const filter = ref<FilterSetting>(null);
const sort = ref<SortSetting>("created_at:desc");

const updateList = async () => {
  isLoading.value = true;
  try {
    const response = await callListForms(filter.value, sort.value);
    forms.value = response.data;

    if (filter.value) {
      params.filter = filter.value;
    } else {
      delete params.filter;
    }

    if (sort.value) {
      params.sort = sort.value;
    } else {
      delete params.sort;
    }
  } catch (e) {
    console.warn(e);
  } finally {
    isLoading.value = false;
  }
};

const changeSort = (setting: SortSetting) => {
  sort.value = setting;
  updateList();
};

const changeFilter = async (setting: FilterSetting) => {
  filter.value = setting;
  updateList();
};

if (params.filter) {
  filter.value = params.filter as FilterSetting;
}
if (params.sort) {
  sort.value = params.sort as SortSetting;
}

// init forms on load
updateList();
</script>
