<template>
  <app-layout title="Dashboard">
    <div class="w-full py-12">
      <div
        class="mx-auto grid max-w-7xl grid-cols-12 gap-x-10 px-4 sm:px-6 lg:px-8"
      >
        <div class="col-span-12 lg:col-span-8">
          <div class="relative mb-6 flex items-center justify-between">
            <div class="flex items-center">
              <h2 class="text-xl font-bold leading-8 text-grey-900">
                Your Forms
              </h2>
              <Label class="ml-2" v-show="filter" color="grey">
                {{ filter }}
                <button @click="filter = null"><D9Icon name="close" /></button>
              </Label>
            </div>
            <div>
              <Popover class="relative inline-block">
                <PopoverButton
                  class="relative mr-2 inline-flex items-center rounded-lg border-transparent bg-grey-100 px-5 py-2 text-sm font-medium leading-4 text-blue-600 ring-blue-300 ring-offset-2 transition duration-150 ease-in-out hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring active:bg-grey-100 active:ring dark:ring-offset-grey-900"
                >
                  Filter
                  <D9Icon class="-mr-1 ml-3 text-blue-600" name="filter" />
                </PopoverButton>
                <PopoverPanel
                  class="absolute z-10 flex flex-col items-stretch rounded bg-grey-50 px-1 py-2 text-grey-700 shadow-lg"
                >
                  <button
                    class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
                    type="button"
                    @click="filter = 'published'"
                  >
                    Published
                  </button>
                  <button
                    class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
                    type="button"
                    @click="filter = 'unpublished'"
                  >
                    Unpublished
                  </button>
                  <button
                    class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
                    type="button"
                    @click="filter = 'trashed'"
                  >
                    Trashed
                  </button>
                </PopoverPanel>
              </Popover>
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

          <div v-else>
            <FormListItem :form="form" :key="form.id" v-for="form in forms" />
          </div>
        </div>
        <UpdatesContainer class="col-span-12 mt-6 lg:col-span-4 lg:mt-0" />
      </div>
    </div>
  </app-layout>
</template>

<script lang="ts" setup>
import AppLayout from "@/Layouts/AppLayout.vue";
import FormListItem from "@/components/Dashboard/FormListItem.vue";
import UpdatesContainer from "@/components/Dashboard/UpdatesContainer.vue";
import CreateFormButton from "@/components/Dashboard/CreateFormButton.vue";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import Label from "@/components/Label.vue";

import { D9Icon } from "@deck9/ui";
import { ref, watch } from "vue";
import { callListForms } from "@/api/forms";

const props = withDefaults(
  defineProps<{
    initialForms: Array<FormModel>;
  }>(),
  {
    initialForms: () => [],
  }
);

const forms = ref<Array<FormModel>>(props.initialForms);
const filter = ref<"published" | "unpublished" | "trashed" | null>(null);

watch(filter, async (newFilter) => {
  const response = await callListForms(newFilter);

  forms.value = response.data;
});
</script>
