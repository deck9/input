<template>
  <a
    class="flex px-8 py-4 mb-2 no-underline bg-white rounded text-grey-900 hover:text-blue-500 transition-sm hover:no-underline"
    :href="route('forms.edit', form.uuid)"
  >
    <div class="flex items-center w-1/2">
      <div
        class="relative flex items-center justify-center w-12 h-12 p-2 overflow-hidden rounded-full"
        :style="`background-color: ${form.brand_color};`"
      >
        <img
          v-if="form.avatar"
          class="absolute inset-0 block"
          :src="`${form.avatar}?w=192&h=192&fit=crop`"
          :alt="`${form.name} Avatar`"
        />
        <span
          v-else
          class="text-sm font-black uppercase"
          :style="`color: ${form.contrast_color}`"
        >{{ form.initials }}</span>
      </div>
      <div class="ml-6">
        <h3 class="mb-1 text-base font-bold">{{ form.name }}</h3>

        <div v-if="form.is_published" class="flex items-center">
          <span class="inline-block w-3 h-3 mr-1 bg-green-500 rounded-full"></span>
          <span class="text-xs text-grey-500">Published</span>
        </div>
        <div v-else class="flex items-center">
          <span class="inline-block w-3 h-3 mr-1 rounded-full bg-grey-200"></span>
          <span class="text-xs text-grey-500">Unpublished</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center w-full">
      <div class="mx-2 leading-none">
        <div class="flex items-center text-xl font-medium font-heading">{{ form.completion_rate }}%</div>
        <div class="mt-1 text-xs text-grey-500">Completion Rate</div>
      </div>
      <div class="mx-2 leading-none">
        <div class="text-xl font-medium font-heading">{{ form.total_sessions }}</div>
        <div class="mt-1 text-xs text-grey-500">Total Sessions</div>
      </div>
    </div>
    <div class="flex items-center justify-end w-24">
      <D9Icon name="chevron-right" />
    </div>
  </a>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";

defineProps<{
  form: FormModel;
}>();
</script>
