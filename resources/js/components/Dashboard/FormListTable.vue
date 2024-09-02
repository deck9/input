<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <table class="min-w-full divide-y divide-grey-300">
          <thead>
            <tr>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-grey-900"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-grey-900"
              >
                Last Change
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-grey-900"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-3 py-3.5 text-left text-sm font-semibold text-grey-900"
              >
                Submissions
              </th>
              <th scope="col" class="relative py-3.5 pl-3 pr-4">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-200 bg-white">
            <FormListItem :form="form" :key="form.id" v-for="form in forms" />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormListItem from "@/components/Dashboard/FormListItem.vue";

defineProps<{
  forms: Array<FormModel>;
}>();
</script>
