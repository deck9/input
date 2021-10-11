<template>
  <app-layout title="Dashboard">
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12 gap-x-10">
        <UpdatesContainer class="col-span-4" />
        <div class="col-span-8">
          <div class="flex justify-between items-center relative mb-6">
            <h2 class="text-xl leading-8 text-grey-900 font-bold">Your Forms</h2>
            <CreateFormButton />
          </div>

          <div
            v-if="!forms.length || forms.length === 0"
            class="bg-white px-16 py-16 rounded w-full text-center"
          >
            <h2
              class="text-center font-heading font-black text-2xl leading-none text-grey-900 mb-4"
            >Start by creating a form</h2>
            <p class="text-grey-600 text-sm">
              You haven't created a survey yet. Click on "New survey" in the top
              right corner to begin with a new survey. To get you started really
              quickly you can watch the following introduction for the BotReach
              editor.
            </p>
          </div>

          <div v-else>
            <FormListItem v-bind="{ form }" v-for="form in forms" />
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script lang="ts" setup>
import AppLayout from "@/Layouts/AppLayout.vue";
import FormListItem from "@/components/Dashboard/FormListItem.vue";
import UpdatesContainer from "@/components/Dashboard/UpdatesContainer.vue"
import CreateFormButton from "@/components/Dashboard/CreateFormButton.vue"
import { withDefaults } from "vue";

const props = withDefaults(defineProps<{
  forms: Array<FormModel>;
}>(), {
  forms: () => [],
});
</script>
