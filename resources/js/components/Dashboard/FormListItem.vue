<template>
  <li
    class="grid grid-cols-[2rem_minmax(0,1fr)_2.75rem] items-start gap-x-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_8rem_11rem_9rem_7rem] lg:items-center lg:gap-4"
  >
    <!-- phone: avatar and name take their own grid cells -->
    <div class="contents lg:flex lg:min-w-0 lg:items-center lg:gap-3">
      <FormAvatar v-bind="{ form }" />
      <component
        :is="form.is_trashed ? 'span' : 'a'"
        class="min-w-0 break-words font-medium text-grey-900 line-clamp-2 hover:text-blue-600 lg:line-clamp-1"
        :href="route('forms.edit', { uuid: form.uuid })"
        :title="form.name"
        dir="auto"
      >
        {{ form.name }}
      </component>
    </div>
    <!-- phone: one meta line under the name; desktop: one column each -->
    <div
      class="col-start-2 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-grey-500 lg:contents"
    >
      <div>
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
      </div>
      <div class="lg:min-w-0">
        <template v-if="form.completed_sessions > 0">
          <a
            class="tabular-nums hover:text-blue-600 lg:text-grey-900"
            :href="route('forms.submissions', form.uuid)"
          >
            <span class="lg:font-semibold">{{
              form.completed_sessions.toLocaleString()
            }}</span>
            {{ form.completed_sessions === 1 ? "submission" : "submissions" }}
          </a>
          <div class="hidden text-xs tabular-nums text-grey-500 lg:block">
            {{ form.total_sessions.toLocaleString() }} started ·
            {{ Math.floor(form.completion_rate) }}% finished
          </div>
        </template>
        <span v-else>No submissions yet</span>
      </div>
      <div class="tabular-nums">
        <span class="sr-only">Last change:</span>
        {{ new Date(form.updated_at).toLocaleDateString() }}
      </div>
    </div>
    <div
      class="col-start-3 row-span-2 row-start-1 flex items-center justify-end space-x-2 lg:col-auto lg:row-auto"
    >
      <a
        v-if="!form.is_trashed"
        class="hidden lg:block"
        :href="route('forms.edit', form.uuid)"
      >
        <D9Button label="Edit" color="light" />
      </a>
      <D9Menu
        class="flex items-center"
        label="Form options"
        position="left"
        use-portal
        @click="setActive"
      >
        <template #button>
          <!-- a 44 px touch target on phones -->
          <span
            class="flex h-11 w-11 items-center justify-center lg:h-auto lg:w-auto"
          >
            <D9Icon
              :class="[
                'relative px-2 rounded leading-none text-grey-500 transition-all duration-150 hover:text-blue-500',
              ]"
              name="cog"
            />
          </span>
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
            @click="openDuplicateDialog"
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
      <FormNameDialog
        :show="isNaming"
        title="Duplicate form"
        label="Name"
        confirmLabel="Duplicate"
        :defaultName="copyName"
        :isSaving="isDuplicating"
        :hasFailed="hasDuplicateFailed"
        @close="isNaming = false"
        @submit="duplicateForm"
      />
    </div>
  </li>
</template>

<script setup lang="ts">
import FormAvatar from "@/components/Dashboard/FormAvatar.vue";
import FormNameDialog from "@/components/Dashboard/FormNameDialog.vue";
import { D9Icon, D9Menu, D9MenuLink, D9Button } from "@deck9/ui";
import { computed, ref } from "vue";
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
const isNaming = ref(false);
const isDuplicating = ref(false);
const hasDuplicateFailed = ref(false);
// by characters like the server's 255 limit, so an emoji isn't cut in half
const copyName = computed(() =>
  Array.from(`${props.form.name} (copy)`).slice(0, 255).join(""),
);

onClickOutside(container, () => {
  isActive.value = false;
});

const setActive = () => {
  isActive.value = true;
};

const setPublishMenuActive = () => {
  isPublishMenuActive.value = true;
};

const openDuplicateDialog = () => {
  hasDuplicateFailed.value = false;
  isNaming.value = true;
};

const duplicateForm = async (newName: string) => {
  try {
    isDuplicating.value = true;
    hasDuplicateFailed.value = false;

    const newFormResponse = await callDuplicateForm(
      props.form,
      newName || copyName.value,
    );

    window.location.href = window.route("forms.edit", {
      uuid: newFormResponse.data.uuid,
    });
  } catch (error) {
    console.warn(error);
    hasDuplicateFailed.value = true;
    isDuplicating.value = false;
  }
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
