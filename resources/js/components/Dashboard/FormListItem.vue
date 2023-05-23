<template>
  <div
    ref="container"
    class="transition-sm group relative mb-2 flex rounded bg-white px-8 py-4 text-grey-900 no-underline shadow-sm transition-transform duration-200 hover:no-underline"
    :class="isActive ? 'ring-2' : ''"
  >
    <div class="flex w-2/5 shrink-0 items-center">
      <div
        class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full p-2"
        :style="`background-color: ${form.brand_color ?? '#232323'};`"
      >
        <span
          class="text-sm font-black uppercase"
          :style="`color: ${form.contrast_color}`"
          >{{ form.initials }}</span
        >
      </div>
      <div class="ml-6 overflow-hidden">
        <h3 class="mb-1 truncate text-base font-bold">
          <a
            class="hover:text-blue-600"
            :href="route('forms.edit', { uuid: form.uuid })"
          >
            {{ form.name }}
          </a>
        </h3>

        <div v-if="form.is_published" class="flex items-center">
          <span
            class="mr-1 inline-block h-3 w-3 rounded-full bg-green-500"
          ></span>
          <span class="text-xs text-grey-500">Published</span>
        </div>
        <div v-else class="flex items-center">
          <span
            class="mr-1 inline-block h-3 w-3 rounded-full bg-grey-200"
          ></span>
          <span class="text-xs text-grey-500">Unpublished</span>
        </div>
      </div>
    </div>
    <div class="flex w-2/5 shrink-0 items-center justify-start">
      <div class="mx-2 leading-none">
        <div class="font-heading text-xl font-medium">
          {{ form.total_sessions }}
        </div>
        <div class="mt-1 text-xs text-grey-500">Total Sessions</div>
      </div>
      <div class="mx-2 leading-none">
        <div class="font-heading flex items-center text-xl font-medium">
          {{ form.completion_rate }}%
        </div>
        <div class="mt-1 text-xs text-grey-500">Completion Rate</div>
      </div>
    </div>
    <div class="flex w-1/5 justify-end">
      <D9Menu
        class="flex items-center"
        position="left"
        use-portal
        @click="setActive"
      >
        <template #button>
          <D9Icon
            :class="[
              'relative px-4 text-grey-600 transition-all duration-150 group-hover:opacity-100',
              isActive ? ' opacity-100' : '  opacity-0',
            ]"
            name="cog"
          />
        </template>
        <D9MenuLink
          as="a"
          :href="route('forms.show', { uuid: form.uuid })"
          target="_blank"
          class="block w-full text-left"
          label="View Form"
        />
        <D9MenuLink
          as="a"
          :href="route('forms.submissions', form.uuid)"
          class="block w-full text-left"
          label="Open Submissions"
        />
        <D9MenuLink
          as="a"
          :href="route('forms.settings', form.uuid)"
          class="block w-full text-left"
          label="Open Settings"
        />
        <D9MenuLink
          as="button"
          type="button"
          class="block w-full text-left"
          label="Duplicate Form"
          @click="duplicateForm"
        />
      </D9Menu>
      <a
        :href="route('forms.edit', form.uuid)"
        class="flex cursor-pointer items-center justify-end transition duration-150 hover:text-blue-600 group-hover:scale-110"
      >
        <D9Icon name="chevron-right" />
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Icon, D9Menu, D9MenuLink } from "@deck9/ui";
import { ref } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps<{
  form: FormModel;
}>();

const container = ref(null);
const isActive = ref(false);

onClickOutside(container, () => {
  isActive.value = false;
});

const setActive = () => {
  isActive.value = true;
};

const duplicateForm = (e) => {
  const form = props.form;

  console.log(`Duplicate form ${form.name}`, e);
};
</script>
