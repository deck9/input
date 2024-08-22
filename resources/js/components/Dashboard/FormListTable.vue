<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <table class="min-w-full divide-y divide-grey-300">
          <thead>
            <tr>
              <th
                scope="col"
                class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-grey-900 sm:pl-0"
              >
                Name
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
              <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                <span class="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-grey-200 bg-white">
            <tr v-for="form in forms" :key="form.email">
              <td class="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                <div class="flex items-center">
                  <div class="h-11 w-11 flex-shrink-0">
                    <div
                      class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full p-2"
                      :style="`background-color: ${form.brand_color ?? '#232323'};`"
                    >
                      <span
                        class="text-sm font-black uppercase"
                        :style="`color: ${form.contrast_color}`"
                        >{{ form.initials }}</span
                      >
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium text-grey-900">
                      {{ form.name }}
                    </div>
                    <div class="mt-1 text-grey-500">
                      {{ form.updated_at }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-grey-500">
                <div class="text-grey-900">{{ form.title }}</div>
                <div class="mt-1 text-grey-500">{{ form.department }}</div>
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-grey-500">
                <span
                  class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
                  >Active</span
                >
              </td>
              <td class="whitespace-nowrap px-3 py-5 text-sm text-grey-500">
                {{ form.role }}
              </td>
              <td
                class="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0"
              >
                <a href="#" class="text-indigo-600 hover:text-indigo-900"
                  >Edit<span class="sr-only">, {{ form.name }}</span></a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  forms: Array<FormModel>;
}>();
</script>
