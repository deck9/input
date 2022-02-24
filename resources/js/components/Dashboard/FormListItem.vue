<template>
  <a
    class="transition-sm text-grey-900 group relative mb-2 flex rounded bg-white px-8 py-4 no-underline shadow-sm hover:cursor-default hover:no-underline"
    :href="route('forms.edit', form.uuid)"
  >
    <div class="flex w-1/2 items-center">
      <div
        class="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full p-2"
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
          >{{ form.initials }}</span
        >
      </div>
      <div class="ml-6">
        <h3 class="mb-1 text-base font-bold">{{ form.name }}</h3>

        <div v-if="form.is_published" class="flex items-center">
          <span
            class="mr-1 inline-block h-3 w-3 rounded-full bg-green-500"
          ></span>
          <span class="text-grey-500 text-xs">Published</span>
        </div>
        <div v-else class="flex items-center">
          <span
            class="bg-grey-200 mr-1 inline-block h-3 w-3 rounded-full"
          ></span>
          <span class="text-grey-500 text-xs">Unpublished</span>
        </div>
      </div>
    </div>
    <div class="flex w-full items-center justify-center">
      <div class="mx-2 leading-none">
        <div class="font-heading flex items-center text-xl font-medium">
          {{ form.completion_rate }}%
        </div>
        <div class="text-grey-500 mt-1 text-xs">Completion Rate</div>
      </div>
      <div class="mx-2 leading-none">
        <div class="font-heading text-xl font-medium">
          {{ form.total_sessions }}
        </div>
        <div class="text-grey-500 mt-1 text-xs">Total Sessions</div>
      </div>
    </div>
    <div
      class="flex w-24 cursor-pointer items-center justify-end group-hover:text-blue-600"
    >
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
