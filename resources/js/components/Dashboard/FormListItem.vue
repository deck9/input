<template>
  <tr>
    <td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm">
      <div class="flex items-center">
        <FormAvatar v-bind="{ form }" />
        <div class="ml-4">
          <component
            :is="form.is_trashed ? 'span' : 'a'"
            class="hover:text-blue-600 font-medium text-grey-900"
            :href="route('forms.edit', { uuid: form.uuid })"
          >
            {{ form.name }}
          </component>
          <a
            :href="route('forms.show', { uuid: form.uuid })"
            target="_blank"
            class="block text-xs text-grey-500 hover:text-blue-600"
            >{{ route("forms.show", { uuid: form.uuid }) }}</a
          >
        </div>
      </div>
    </td>
    <td class="whitespace-nowrap px-3 py-3 text-sm text-grey-500">
      {{ new Date(form.updated_at).toLocaleDateString() }}
    </td>
    <td class="whitespace-nowrap px-3 py-3 text-sm text-grey-500">
      <D9Menu use-portal @click="setPublishMenuActive" position="right">
        <template v-if="form.is_trashed" #button>
          <span
            class="inline-flex items-center rounded-md bg-yellow-200 px-2 py-1 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-800/20"
            >Archived</span
          >
        </template>
        <template v-else-if="form.is_published" #button>
          <span
            class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
            >Published</span
          >
        </template>
        <template v-else #button>
          <span
            class="inline-flex items-center rounded-md bg-grey-50 px-2 py-1 text-xs font-medium text-grey-700 ring-1 ring-inset ring-grey-600/20"
            >Unpublished</span
          >
        </template>

        <D9MenuLink
          v-if="!form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Set to Published"
          @click="publishForm"
        />
        <D9MenuLink
          v-if="form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Set to Unpublished"
          @click="unpublishForm"
        />
        <D9MenuLink
          v-if="!form.is_published && !form.is_trashed"
          as="button"
          type="button"
          class="block w-full text-left"
          label="Archive Form"
          @click="deleteForm"
        />
      </D9Menu>
    </td>
    <td class="whitespace-nowrap px-3 py-3 text-sm text-grey-500">
      <div class="flex space-x-3">
        <div class="leading-tight">
          <div
            class="font-heading text-lg font-medium leading-none text-grey-900"
          >
            {{ form.total_sessions }}
          </div>
          <div class="text-xs text-grey-500">Sessions</div>
        </div>
        <a class="block group" :href="route('forms.submissions', form.uuid)">
          <div
            class="font-heading text-lg font-medium leading-none text-grey-900 group-hover:text-blue-600"
          >
            {{ form.completed_sessions }}
          </div>
          <div class="text-xs text-grey-500">Submissions</div>
        </a>
        <div>
          <div
            class="font-heading text-lg font-medium leading-none text-grey-900"
          >
            {{ form.completion_rate }}%
          </div>
          <div class="text-xs text-grey-500">Completion Rate</div>
        </div>
      </div>
    </td>
    <td
      class="relative whitespace-nowrap py-3 pl-3 pr-4 text-right text-sm font-medium"
    >
      <div class="flex items-center justify-end space-x-2">
        <a v-if="!form.is_trashed" :href="route('forms.edit', form.uuid)">
          <D9Button label="Edit" color="light" />
        </a>
        <D9Menu
          class="flex items-center"
          position="left"
          use-portal
          @click="setActive"
        >
          <template #button>
            <D9Icon
              :class="[
                'relative px-2 rounded leading-none text-grey-500 transition-all duration-150 hover:text-blue-500',
              ]"
              name="cog"
            />
          </template>
          <template v-if="!form.is_trashed">
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
              as="button"
              type="button"
              class="block w-full text-left"
              label="Duplicate Form"
              @click="duplicateForm"
            />
          </template>
          <template v-else>
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
          </template>
        </D9Menu>
      </div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import FormAvatar from "@/components/Dashboard/FormAvatar.vue";
import { D9Icon, D9Menu, D9MenuLink, D9Button } from "@deck9/ui";
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
const isPublishMenuActive = ref(false);

onClickOutside(container, () => {
  isActive.value = false;
});

const setActive = () => {
  isActive.value = true;
};

const setPublishMenuActive = () => {
  isPublishMenuActive.value = true;
};

const duplicateForm = async () => {
  const form = props.form;

  isActive.value = false;

  const newName = window.prompt(
    "Please enter a name for the new form",
    `Copy of ${form.name}`,
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
  await callUnpublishForm(props.form);

  window.location.reload();
};

const restoreForm = async () => {
  await callRestoreForm(props.form);

  window.location.reload();
};

const deleteForm = async () => {
  const result = window.confirm("Are you sure you want to delete your form?");

  if (!result) {
    return;
  }

  await callDeleteForm(props.form);

  window.location.reload();
};

const deleteForever = async () => {
  const result = window.confirm(
    "Are you sure you want to delete your form permanently. This action cannot be undone.",
  );

  if (!result) {
    return;
  }

  await callDeleteForeverForm(props.form);

  window.location.reload();
};
</script>
