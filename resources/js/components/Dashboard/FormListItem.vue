<template>
  <li
    v-if="!isDeleted"
    ref="row"
    class="grid grid-cols-[2rem_minmax(0,1fr)_2.75rem] items-start gap-x-3 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_8rem_11rem_9rem_7rem] lg:items-center lg:gap-4"
  >
    <!-- phone: avatar and name take their own grid cells -->
    <div class="contents lg:flex lg:min-w-0 lg:items-center lg:gap-3">
      <FormAvatar v-bind="{ form }" />
      <component
        :is="isTrashed ? 'span' : 'a'"
        class="min-w-0 break-words font-medium text-grey-900 line-clamp-2 lg:line-clamp-1"
        :class="{ 'hover:text-blue-600': !isTrashed }"
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
        <span
          v-if="isTrashed"
          class="inline-flex items-center rounded-md bg-yellow-200 px-2 py-1 text-xs font-medium text-yellow-900 ring-1 ring-inset ring-yellow-800/20"
          >Archived</span
        >
        <span
          v-else-if="isPublished"
          class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20"
          >Published</span
        >
        <span
          v-else
          class="inline-flex items-center rounded-md bg-grey-50 px-2 py-1 text-xs font-medium text-grey-700 ring-1 ring-inset ring-grey-600/20"
          >Unpublished</span
        >
      </div>
      <div class="lg:min-w-0">
        <template v-if="form.completed_sessions > 0">
          <!-- an archived form's submissions page is gone -->
          <component
            :is="isTrashed ? 'span' : 'a'"
            class="tabular-nums lg:text-grey-900"
            :class="{ 'hover:text-blue-600': !isTrashed }"
            :href="route('forms.submissions', form.uuid)"
          >
            <span class="lg:font-semibold">{{
              form.completed_sessions.toLocaleString()
            }}</span>
            {{ form.completed_sessions === 1 ? "submission" : "submissions" }}
          </component>
          <div class="hidden text-xs tabular-nums text-grey-500 lg:block">
            {{ form.total_sessions.toLocaleString() }} started ·
            {{ Math.floor(form.completion_rate) }}% finished
          </div>
        </template>
        <span v-else>No submissions yet</span>
      </div>
      <div class="tabular-nums">
        <span class="sr-only">Last edited:</span>
        {{ new Date(form.updated_at).toLocaleDateString() }}
      </div>
    </div>
    <div
      class="col-start-3 row-span-2 row-start-1 flex items-center justify-end gap-1 lg:col-auto lg:row-auto"
    >
      <!-- on phones Copy link stays in the menu -->
      <button
        v-if="isPublished && !isTrashed"
        type="button"
        class="hidden h-9 w-9 items-center justify-center rounded-md text-grey-500 transition-colors hover:bg-grey-100 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex"
        :aria-label="`Copy link to ${form.name}`"
        title="Copy link"
        @click="copyLink"
      >
        <D9Icon name="link" />
      </button>
      <!-- the D9 menu button hides its outline: ring the icon instead -->
      <D9Menu
        class="flex items-center [&>button:focus-visible>span]:ring-2 [&>button:focus-visible>span]:ring-blue-500"
        :label="`Actions for ${form.name}`"
        position="left"
        use-portal
      >
        <template #button>
          <!-- a 44 px touch target on phones -->
          <span
            class="flex h-11 w-11 items-center justify-center rounded-md text-grey-500 transition-colors hover:bg-grey-100 hover:text-blue-600 lg:h-9 lg:w-9"
          >
            <D9Icon name="ellipsis" />
          </span>
        </template>
        <template v-if="!isTrashed">
          <D9MenuLink
            as="a"
            :href="route('forms.edit', form.uuid)"
            :class="menuItem"
            label="Edit"
          />
          <D9MenuLink
            as="a"
            :href="route('forms.submissions', form.uuid)"
            :class="menuItem"
            label="View submissions"
          />
          <D9MenuLink
            v-if="isPublished"
            as="button"
            type="button"
            :class="menuItem"
            label="Copy link"
            @click="copyLink"
          />
          <D9MenuLink
            as="a"
            :href="route('forms.show', { uuid: form.uuid })"
            target="_blank"
            :class="menuItem"
            label="Open form"
          />
          <D9MenuLink
            as="a"
            :href="route('forms.settings', form.uuid)"
            :class="menuItem"
            label="Settings"
          />
          <div role="separator" class="my-1 h-px bg-grey-100"></div>
          <D9MenuLink
            as="button"
            type="button"
            :class="menuItem"
            label="Duplicate…"
            @click="openDuplicateDialog"
          />
          <D9MenuLink
            v-if="isPublished"
            as="button"
            type="button"
            :class="menuItem"
            :label="form.completed_sessions > 0 ? 'Unpublish…' : 'Unpublish'"
            @click="askUnpublish"
          />
          <D9MenuLink
            v-else
            as="button"
            type="button"
            :class="menuItem"
            label="Publish"
            @click="publish"
          />
          <div role="separator" class="my-1 h-px bg-grey-100"></div>
          <D9MenuLink
            as="button"
            type="button"
            :class="menuItem"
            label="Archive…"
            @click="askArchive"
          />
        </template>
        <template v-else>
          <D9MenuLink
            as="button"
            type="button"
            :class="menuItem"
            label="Restore"
            @click="restore"
          />
          <D9MenuLink
            as="button"
            type="button"
            :class="[menuItem, '!text-red-700']"
            label="Delete permanently…"
            @click="askDelete"
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
        @close="closeNaming"
        @submit="duplicateForm"
      />
      <ConfirmationModal
        :show="question !== null"
        max-width="md"
        :closeable="!isAnswering"
        :danger="!!question?.isDanger"
        @close="closeQuestion"
      >
        <template #title>
          <span class="font-semibold [overflow-wrap:anywhere]">{{
            question?.title
          }}</span>
        </template>
        <template #content>
          <p class="text-sm text-grey-600">{{ question?.text }}</p>
        </template>
        <template #footer>
          <D9Button
            ref="cancelButton"
            label="Cancel"
            color="light"
            class="!bg-white shadow-[inset_0_0_0_1px_theme(colors.grey.300)] hover:!bg-blue-100"
            :isDisabled="isAnswering"
            @click="closeQuestion"
          />
          <!-- shaped like the D9 Cancel next to it -->
          <DangerButton
            v-if="question?.isDanger"
            class="ml-2 !rounded-lg !border-0 !px-5 !text-sm !font-medium !normal-case !leading-4 !tracking-normal disabled:!opacity-50"
            :disabled="isAnswering"
            @click="answer"
          >
            {{ question.confirmLabel }}
          </DangerButton>
          <D9Button
            v-else
            class="ml-2"
            :label="question?.confirmLabel ?? ''"
            :isLoading="isAnswering"
            @click="answer"
          />
        </template>
      </ConfirmationModal>
    </div>
  </li>
</template>

<script setup lang="ts">
import FormAvatar from "@/components/Dashboard/FormAvatar.vue";
import FormNameDialog from "@/components/Dashboard/FormNameDialog.vue";
import ConfirmationModal from "@/Jetstream/ConfirmationModal.vue";
import DangerButton from "@/Jetstream/DangerButton.vue";
import { D9Icon, D9Menu, D9MenuLink, D9Button } from "@deck9/ui";
import { computed, nextTick, ref, watch } from "vue";
import { useClipboard } from "@vueuse/core";
import {
  callDeleteForeverForm,
  callDeleteForm,
  callDuplicateForm,
  callPublishForm,
  callRestoreForm,
  callUnpublishForm,
} from "@/api/forms";

type Announcement = { text: string; copy?: () => void };
type Question = {
  title: string;
  text: string;
  confirmLabel: string;
  isDanger?: boolean;
  run: () => Promise<void>;
};

const props = defineProps<{
  form: FormModel;
}>();

const emit = defineEmits<{
  announce: [announcement: Announcement];
}>();

// the row changes in place after an action, until the list loads again
const isPublished = ref(props.form.is_published);
const isTrashed = ref(props.form.is_trashed);
const isDeleted = ref(false);
watch(
  () => props.form,
  (form) => {
    isPublished.value = form.is_published;
    isTrashed.value = form.is_trashed;
  },
);

// 44 px tall on phones, 36 px from lg
const menuItem = "block w-full text-left !py-3 !text-sm lg:!py-2";

const row = ref<HTMLElement | null>(null);
const menuButton = (li?: Element | null) =>
  li?.querySelector<HTMLElement>("[aria-haspopup=menu]");
const focusMenu = () => menuButton(row.value)?.focus();
const cancelButton = ref<InstanceType<typeof D9Button> | null>(null);
const question = ref<Question | null>(null);
const isAnswering = ref(false);

const isNaming = ref(false);
const isDuplicating = ref(false);
const hasDuplicateFailed = ref(false);
// by characters like the server's 255 limit, so an emoji isn't cut in half
const copyName = computed(() =>
  Array.from(`${props.form.name} (copy)`).slice(0, 255).join(""),
);

// legacy: copying also works on a self-host without https
const { copy } = useClipboard({ legacy: true });

const copyLink = async () => {
  // the copy without https moves focus to a hidden field
  const focused = document.activeElement;
  await copy(window.route("forms.show", { uuid: props.form.uuid }));
  if (focused instanceof HTMLElement && row.value?.contains(focused)) {
    focused.focus();
  } else {
    // the menu and the toast both go away
    focusMenu();
  }
  emit("announce", { text: "Link copied" });
};

const act = async (
  verb: string,
  run: () => Promise<unknown>,
  done: Announcement,
) => {
  try {
    await run();
    emit("announce", done);
  } catch (error) {
    console.warn(error);
    emit("announce", { text: `Couldn't ${verb} the form. Try again.` });
  }
};

const ask = async (next: Question) => {
  question.value = next;
  await nextTick();
  cancelButton.value?.$el.focus();
};

const answer = async () => {
  isAnswering.value = true;
  await question.value?.run();
  isAnswering.value = false;
  closeQuestion();
};

// a deleted row is gone, so its neighbour's menu gets the focus
let neighbour: Element | null = null;

const closeQuestion = () => {
  question.value = null;
  if (!isDeleted.value) {
    return focusMenu();
  }

  // no row left: the page's Create form button
  (
    menuButton(neighbour) ??
    document.querySelector<HTMLElement>('button[aria-label="Create form"]')
  )?.focus();
};

const submissions = (count: number) =>
  count === 1 ? "1 submission" : `${count.toLocaleString()} submissions`;

const publish = () =>
  act(
    "publish",
    async () => {
      await callPublishForm(props.form);
      isPublished.value = true;
    },
    { text: `${props.form.name} is live.`, copy: copyLink },
  );

const unpublish = () =>
  act(
    "unpublish",
    async () => {
      await callUnpublishForm(props.form);
      isPublished.value = false;
    },
    { text: `${props.form.name} unpublished.` },
  );

// unpublished forms show visitors a 404 page
const askUnpublish = () => {
  const count = props.form.completed_sessions;
  if (count === 0) {
    return unpublish();
  }

  ask({
    title: `Unpublish "${props.form.name}"?`,
    text: `Visitors get a "not found" page instead of the form. Your ${submissions(count)} ${count === 1 ? "stays" : "stay"}.`,
    confirmLabel: "Unpublish",
    run: unpublish,
  });
};

const askArchive = () =>
  ask({
    title: `Archive "${props.form.name}"?`,
    text: isPublished.value
      ? "It goes offline and moves to Archived. If you restore it, it comes back unpublished."
      : "It moves to Archived. You can restore it there.",
    confirmLabel: "Archive",
    run: () =>
      act(
        "archive",
        async () => {
          await callDeleteForm(props.form);
          isTrashed.value = true;
        },
        { text: `${props.form.name} archived.` },
      ),
  });

const restore = () =>
  act(
    "restore",
    async () => {
      // the server decides if a restored form is live
      const { data } = await callRestoreForm(props.form);
      isPublished.value = data.is_published;
      isTrashed.value = false;
    },
    { text: `${props.form.name} restored.` },
  );

const askDelete = () => {
  const count = props.form.completed_sessions;

  ask({
    title: `Delete "${props.form.name}"${count > 0 ? ` and its ${submissions(count)}` : ""}?`,
    text: "This can't be undone.",
    confirmLabel: "Delete permanently",
    isDanger: true,
    run: () =>
      act(
        "delete",
        async () => {
          await callDeleteForeverForm(props.form);
          neighbour =
            row.value?.nextElementSibling ??
            row.value?.previousElementSibling ??
            null;
          isDeleted.value = true;
        },
        { text: `${props.form.name} deleted.` },
      ),
  });
};

// the dialog would focus the menu item it opened from, which is gone
const closeNaming = () => {
  isNaming.value = false;
  focusMenu();
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
</script>
