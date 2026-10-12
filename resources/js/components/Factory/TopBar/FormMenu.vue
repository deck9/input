<template>
  <!-- the D9 menu button hides its outline: ring the inner span instead -->
  <D9Menu
    class="!flex min-w-0 [&>button:focus-visible>span]:ring-2 [&>button:focus-visible>span]:ring-blue-500 [&>button]:min-w-0 [&>button]:max-w-full"
    position="right"
    use-portal
  >
    <template #button>
      <span
        class="flex h-11 min-w-0 items-center gap-1.5 rounded-md px-2 text-sm font-semibold text-white transition-colors hover:bg-grey-700 lg:h-9 lg:max-w-[200px] xl:max-w-[300px]"
      >
        <span class="sr-only">Form menu: </span>
        <span dir="auto" class="truncate">{{ store.form?.name }}</span>
        <D9Icon class="flex-none" name="chevron-down" />
      </span>
    </template>
    <D9MenuLink
      as="button"
      type="button"
      :class="menuItem"
      label="Rename…"
      @click="openRename"
    />
    <D9MenuLink
      as="a"
      :href="route('forms.template-download', { form: store.formId })"
      target="_blank"
      :class="menuItem"
      label="Download as template"
    />
    <div role="separator" class="my-1 h-px bg-grey-100"></div>
    <D9MenuLink
      as="button"
      type="button"
      :class="[menuItem, '!text-red-700']"
      label="Archive form…"
      @click="openArchive"
    />
  </D9Menu>

  <FormNameDialog
    :show="isRenaming"
    title="Rename form"
    label="Name"
    confirmLabel="Rename"
    :defaultName="store.form?.name ?? ''"
    :isSaving="isSaving"
    :hasFailed="hasFailed"
    failText="Couldn't rename the form. Try again."
    @close="isRenaming = false"
    @submit="rename"
  />

  <ConfirmationModal
    :show="isArchiving"
    max-width="md"
    :closeable="!isSaving"
    @close="isArchiving = false"
  >
    <template #title>
      <span class="font-semibold [overflow-wrap:anywhere]"
        >Archive "{{ store.form?.name }}"?</span
      >
    </template>
    <template #content>
      <p class="text-sm text-grey-600">
        {{
          store.form?.is_published
            ? "It goes offline and moves to Archived. If you restore it, it comes back unpublished."
            : "It moves to Archived. You can restore it there."
        }}
      </p>
      <p v-if="hasFailed" role="alert" class="mt-2 text-sm text-red-700">
        Couldn't archive the form. Try again.
      </p>
    </template>
    <template #footer>
      <D9Button
        label="Cancel"
        color="light"
        :isDisabled="isSaving"
        @click="isArchiving = false"
      />
      <D9Button
        class="ml-2"
        label="Archive"
        :isLoading="isSaving"
        @click="archive"
      />
    </template>
  </ConfirmationModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { router } from "@inertiajs/vue3";
import { D9Button, D9Icon, D9Menu, D9MenuLink } from "@deck9/ui";
import ConfirmationModal from "@/Jetstream/ConfirmationModal.vue";
import FormNameDialog from "@/components/Dashboard/FormNameDialog.vue";
import { useForm } from "@/stores";

const store = useForm();

// as on the dashboard: 44 px rows on phones
const menuItem = "block w-full text-left !py-3 !text-sm lg:!py-2";

const isRenaming = ref(false);
const isArchiving = ref(false);
const isSaving = ref(false);
const hasFailed = ref(false);

const openRename = () => {
  hasFailed.value = false;
  isRenaming.value = true;
};

const openArchive = () => {
  hasFailed.value = false;
  isArchiving.value = true;
};

const rename = async (name: string) => {
  if (!name || name === store.form?.name) {
    isRenaming.value = false;
    return;
  }

  isSaving.value = true;
  hasFailed.value = false;

  try {
    await store.updateForm({ name });
    isRenaming.value = false;
  } catch {
    hasFailed.value = true;
  }

  isSaving.value = false;
};

const archive = async () => {
  isSaving.value = true;
  hasFailed.value = false;

  try {
    await store.deleteForm();
    router.visit(window.route("dashboard"));
  } catch {
    hasFailed.value = true;
    isSaving.value = false;
  }
};
</script>
