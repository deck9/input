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
          <component
            :is="form.is_trashed ? 'span' : 'a'"
            class="hover:text-blue-600"
            :href="route('forms.edit', { uuid: form.uuid })"
          >
            {{ form.name }}
          </component>
        </h3>

        <div class="flex items-center">
          <template v-if="form.is_trashed">
            <span
              class="mr-1 inline-block h-3 w-3 rounded-full bg-red-500"
            ></span>
            <span class="text-xs text-grey-500">Deleted</span>
          </template>
          <template v-else-if="form.is_published">
            <span
              class="mr-1 inline-block h-3 w-3 rounded-full bg-green-500"
            ></span>
            <span class="text-xs text-grey-500">Published</span>
          </template>
          <template v-else>
            <span
              class="mr-1 inline-block h-3 w-3 rounded-full bg-grey-200"
            ></span>
            <span class="text-xs text-grey-500">Unpublished</span>
          </template>
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
    <div class="flex w-1/5 items-center justify-end">
      <D9Menu
        class="flex items-center"
        position="left"
        use-portal
        v-if="!form.is_trashed"
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
          label="Submissions"
        />
        <D9MenuLink
          as="a"
          :href="route('forms.settings', form.uuid)"
          class="block w-full text-left"
          label="Settings"
        />
        <D9MenuLink
          v-if="!form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Publish Form"
          @click="publishForm"
        />
        <D9MenuLink
          v-if="form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Unpublish Form"
          @click="unpublishForm"
        />
        <D9MenuLink
          v-if="!form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Delete Form"
          @click="deleteForm"
        />
        <D9MenuLink
          as="button"
          type="button"
          class="block w-full text-left"
          label="Duplicate Form"
          @click="duplicateForm"
        />
      </D9Menu>
      <D9Menu
        class="flex items-center"
        position="left"
        use-portal
        v-else
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
          as="button"
          type="button"
          class="block w-full text-left"
          label="Restore Form"
          @click="restoreForm"
        />
        <D9MenuLink
          as="button"
          type="button"
          class="block w-full text-left"
          label="Delete forever"
          @click="deleteForever"
        />
      </D9Menu>
      <a
        v-if="!form.is_trashed"
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
import {
  callDeleteForeverForm,
  callDeleteForm,
  callDuplicateForm,
  callPublishForm,
  callRestoreForm,
  callUnpublishForm,
} from "@/api/forms";

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

const duplicateForm = async () => {
  const form = props.form;

  isActive.value = false;

  const newName = window.prompt(
    "Please enter a name for the new form",
    `Copy of ${form.name}`
  );

  if (!newName) {
    return;
  }

  const newFormResponse = await callDuplicateForm(form, newName);

  window.location.href = window.route("forms.edit", {
    uuid: newFormResponse.data.uuid,
  });
};

const publishForm = async () => {
  await callPublishForm(props.form);

  window.location.reload();
};

const unpublishForm = async () => {
  await callUnpublishForm(props.form)

  window.location.reload();
};

const restoreForm = async () => {
  const restored = await callRestoreForm(props.form);

  window.location.href = window.route("forms.edit", {
    uuid: restored.data.uuid,
  });
};

const deleteForm = async () => {
  window.confirm(
    "Are you sure you want to delete your form?"
  );

  await callDeleteForm(props.form);

  window.location.reload();
};

const deleteForever = async () => {
  window.confirm(
    "Are you sure you want to delete your form permanently. This action cannot be undone."
  );

  await callDeleteForeverForm(props.form);

  window.location.reload();
};
</script>
