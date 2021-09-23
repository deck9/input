<template>
  <a
    class="
      bg-white
      rounded
      border border-grey-300
      flex
      px-6
      py-4
      mb-2
      hover:border-blue-300
      transition-sm
      no-underline
      hover:no-underline
    "
    :href="route('forms.edit', form.uuid)"
  >
    <div class="w-1/2 flex items-center">
      <div
        class="
          rounded-full
          overflow-hidden
          p-2
          h-12
          w-12
          flex
          items-center
          justify-center
          relative
        "
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
        <h3 class="text-grey-900 font-bold mb-1 text-base">
          {{ form.name }}
        </h3>

        <div v-if="form.is_published" class="flex items-center">
          <span
            class="inline-block mr-1 w-3 h-3 rounded-full bg-green-500"
          ></span>
          <span class="text-xs text-grey-500">Published</span>
        </div>
        <div v-else class="flex items-center">
          <span
            class="inline-block mr-1 w-3 h-3 rounded-full bg-grey-200"
          ></span>
          <span class="text-xs text-grey-500">Unpublished</span>
        </div>
      </div>
    </div>
    <div class="w-full flex items-center justify-center">
      <div class="leading-none mx-2">
        <div
          class="
            text-xl
            font-medium font-heading
            text-grey-900
            flex
            items-center
          "
        >
          {{ form.completion_rate }}%
        </div>
        <div class="text-grey-500 text-xs mt-1">Completion Rate</div>
      </div>
      <div class="leading-none mx-2">
        <div class="text-xl font-medium font-heading text-grey-900">
          {{ form.total_sessions }}
        </div>
        <div class="text-grey-500 text-xs mt-1">Total Sessions</div>
      </div>
    </div>
    <div class="w-24 flex items-center justify-end">View</div>
  </a>
</template>

<script setup lang="ts">
import type { FormModel } from "@/types/index";

interface FormListItemProps {
  form: FormModel;
}

const props = defineProps<FormListItemProps>();
</script>
