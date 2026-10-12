<template>
  <div v-if="!store.form?.is_published">
    <D9Button
      ref="publishButton"
      label="Publish"
      class="h-11 whitespace-nowrap lg:h-9"
      @click="openCheck"
    />

    <DialogModal :show="isChecking" max-width="md" @close="isChecking = false">
      <template #title>
        <h2 class="font-semibold [overflow-wrap:anywhere]">
          Publish "{{ store.form?.name }}"?
        </h2>
      </template>
      <template #content>
        <ul class="flex flex-col gap-2.5 text-sm text-grey-900">
          <li v-if="hasCheckFailed" class="flex flex-wrap items-center gap-x-3">
            <span role="alert" class="text-red-700"
              >Couldn't check the questions and rules.</span
            >
            <button
              ref="checkAgainButton"
              type="button"
              class="h-11 rounded-md font-medium text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:h-auto"
              @click="checkAgain"
            >
              Check again
            </button>
          </li>
          <li v-else-if="!checks">Checking your form…</li>
          <li
            v-for="row in checks ?? []"
            :key="row.text"
            class="flex items-start gap-2.5"
          >
            <CheckIcon :tone="row.isOk ? 'ok' : 'warning'" />
            <span
              ><span v-if="!row.isOk" class="sr-only">Warning: </span
              >{{ row.text }}</span
            >
          </li>
          <li v-if="!store.form?.privacy_link" class="flex items-start gap-2.5">
            <CheckIcon tone="note" />
            <span
              ><span class="sr-only">Note: </span>No privacy page linked. You
              can add one in
              <a
                class="font-medium text-blue-700 underline"
                :href="`${route('forms.settings', { uuid: store.formId })}#privacy`"
                >Settings</a
              >.</span
            >
          </li>
        </ul>
        <p class="mt-4 text-sm text-grey-600">
          Once it's live, every change you make goes live at once.
        </p>
        <p v-if="hasFailed" role="alert" class="mt-2 text-sm text-red-700">
          Couldn't publish the form. Try again.
        </p>
      </template>
      <template #footer>
        <D9Button
          ref="cancelButton"
          label="Cancel"
          color="light"
          class="!bg-white shadow-[inset_0_0_0_1px_theme(colors.grey.300)] hover:!bg-blue-100"
          :isDisabled="isBusy"
          @click="isChecking = false"
        />
        <D9Button
          ref="confirmButton"
          class="ml-2"
          label="Publish"
          :isLoading="isBusy"
          :isDisabled="!checks"
          @click="publish"
        />
      </template>
    </DialogModal>
  </div>

  <!-- static on phones: the panel spans the bar, from lg it sits under the button -->
  <Popover v-else class="lg:relative">
    <PopoverButton
      ref="shareButton"
      :as="D9Button"
      label="Share"
      icon="link"
      icon-position="left"
      aria-haspopup="dialog"
      class="h-11 whitespace-nowrap lg:h-9"
    />
    <PopoverPanel
      role="dialog"
      aria-labelledby="share-title"
      class="absolute inset-x-2 top-full z-30 mt-1 flex flex-col gap-3 rounded-lg border border-grey-200 bg-white p-4 text-grey-900 shadow-lg lg:inset-x-auto lg:right-0 lg:mt-2 lg:w-[360px]"
    >
      <h2 id="share-title" class="text-sm font-semibold">Share your form</h2>
      <div class="flex gap-2">
        <label class="sr-only" for="share-link">Form link</label>
        <input
          id="share-link"
          readonly
          :value="store.formUrl"
          class="h-11 min-w-0 flex-1 rounded-md border-grey-300 bg-grey-50 px-2.5 text-sm lg:h-9"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <D9Button
          :label="copied ? 'Copied' : 'Copy link'"
          class="h-11 flex-none whitespace-nowrap lg:h-9"
          @click="copyLink"
        />
      </div>
      <a
        :href="store.formUrl"
        target="_blank"
        rel="noopener"
        class="flex h-11 items-center gap-1.5 self-start rounded-md border border-grey-300 px-3 text-sm font-semibold lg:h-9 text-grey-700 hover:border-grey-400 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >Open form <span aria-hidden="true">↗</span
        ><span class="sr-only">&nbsp;(opens in a new tab)</span></a
      >
      <p class="text-xs text-grey-600">
        Every change you make goes live at once.
      </p>
      <div role="separator" class="h-px bg-grey-200"></div>
      <button
        type="button"
        class="-ml-2 h-11 self-start rounded-md px-2 text-sm font-semibold text-red-700 lg:h-9 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        :disabled="isBusy"
        @click="unpublish"
      >
        Unpublish…
      </button>
      <p v-if="hasFailed" role="alert" class="text-sm text-red-700">
        Couldn't unpublish the form. Try again.
      </p>
    </PopoverPanel>
  </Popover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { D9Button } from "@deck9/ui";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import { useClipboard } from "@vueuse/core";
import DialogModal from "@/Jetstream/DialogModal.vue";
import { callGetFormBlocks } from "@/api/blocks";
import { useForm } from "@/stores";
import CheckIcon from "./CheckIcon.vue";
import { publishCheck } from "./publishCheck";

const store = useForm();

const isChecking = ref(false);
const isBusy = ref(false);
const hasFailed = ref(false);
const hasCheckFailed = ref(false);

// only the editor's blocks have their rules (Submissions loads them without),
// the other pages fetch them for the check
const hasRules = (blocks: FormBlockModel[] | null): blocks is FormBlockModel[] =>
  !!blocks && (blocks.length === 0 || blocks.some((block) => "logics" in block));
const fetched = ref<FormBlockModel[] | null>(null);
const checks = computed(() => {
  const blocks = hasRules(store.blocks) ? store.blocks : fetched.value;
  return blocks ? publishCheck(blocks) : null;
});

const loadBlocks = async () => {
  if (!store.formId) {
    return;
  }

  hasCheckFailed.value = false;
  fetched.value = null;

  try {
    fetched.value = (await callGetFormBlocks(store.formId)).data;
  } catch {
    hasCheckFailed.value = true;
  }
};

const checkAgainButton = ref<HTMLButtonElement | null>(null);
const confirmButton = ref<InstanceType<typeof D9Button> | null>(null);

// Check again goes away while checking: hand the focus on
const checkAgain = async () => {
  await loadBlocks();
  await nextTick();
  (checks.value ? confirmButton.value?.$el : checkAgainButton.value)?.focus();
};

const cancelButton = ref<InstanceType<typeof D9Button> | null>(null);

const openCheck = async () => {
  hasFailed.value = false;
  isChecking.value = true;

  if (!hasRules(store.blocks)) {
    loadBlocks();
  }

  // start on Cancel, not on a link in the middle of the list
  await nextTick();
  cancelButton.value?.$el.focus();
};

const publishButton = ref<InstanceType<typeof D9Button> | null>(null);
const shareButton = ref<InstanceType<typeof PopoverButton> | null>(null);

// the button you used turns into the other one: focus that
const focusNext = async () => {
  await nextTick();
  (store.form?.is_published ? shareButton : publishButton).value?.$el.focus();
};

const publish = async () => {
  isBusy.value = true;
  hasFailed.value = false;

  try {
    await store.publishForm();
    isChecking.value = false;
    focusNext();
  } catch {
    hasFailed.value = true;
  }

  isBusy.value = false;
};

const { copy, copied } = useClipboard({ legacy: true });

const copyLink = async () => {
  // the copy without https moves focus to a hidden field
  const focused = document.activeElement;
  await copy(store.formUrl);
  (focused as HTMLElement | null)?.focus();
};

const unpublish = async () => {
  if (
    !window.confirm(
      "Are you sure you want to unpublish this form? People will no longer be able to submit to it.",
    )
  ) {
    return;
  }

  isBusy.value = true;
  hasFailed.value = false;

  try {
    await store.unpublishForm();
    focusNext();
  } catch {
    hasFailed.value = true;
  }

  isBusy.value = false;
};
</script>
