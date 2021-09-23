<template>
  <app-layout title="Dashboard">
    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-12">
        <div class="col-span-8">
          <div class="flex justify-between items-center relative">
            <D9Button class="mb-6" label="Create new form" icon="user" iconPosition="right" />
          </div>

          <div
            v-if="!forms.length || forms.length === 0"
            class="
              bg-grey-100
              px-16
              py-10
              rounded
              w-full
              text-center
              max-w-2xl
              mx-auto
            "
          >
            <h2
              class="
                text-center
                font-heading font-black
                text-3xl
                leading-none
                text-grey-900
                pb-8
              "
            >
              Create your first survey
            </h2>
            <p class="leading-loose text-grey-900 text-base">
              You haven't created a survey yet. Click on "New survey" in the top
              right corner to begin with a new survey. To get you started really
              quickly you can watch the following introduction for the BotReach
              editor.
            </p>
          </div>

          <div v-else>
            <FormListItem v-bind="{form}" v-for="form in forms" />
          </div>
        </div>
        <div class="col-span-4"></div>
      </div>
    </div>
  </app-layout>
</template>

<script lang="ts" setup>
import AppLayout from "@/Layouts/AppLayout.vue";
import FormListItem from "@/components/Dashboard/FormListItem.vue";
import { D9Button } from "@deck9/ui";
import { FormModel } from "@/types";
import { withDefaults } from "vue";

interface DashboardProps {
  forms: Array<FormModel>;
}

const props = withDefaults(defineProps<DashboardProps>(), {
  forms: () => [],
});
</script>
