<template>
  <div v-if="!store.form?.is_published">
    <D9Button
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
          <li v-if="!checks">
            {{
              hasCheckFailed
                ? "Couldn't check the questions and rules."
                : "Checking your form…"
            }}
          </li>
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
          label="Cancel"
          color="light"
          :isDisabled="isBusy"
          @click="isChecking = false"
        />
        <D9Button
          class="ml-2"
          label="Publish"
          :isLoading="isBusy"
          @click="publish"
        />
      </template>
    </DialogModal>
  </div>

  <!-- static on phones: the panel spans the bar, from lg it sits under the button -->
  <Popover v-else class="lg:relative">
    <PopoverButton
      :as="D9Button"
      label="Share"
      icon="link"
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
          class="h-9 min-w-0 flex-1 rounded-md border-grey-300 bg-grey-50 px-2.5 text-sm"
          @focus="($event.target as HTMLInputElement).select()"
        />
        <D9Button
          :label="copied ? 'Copied' : 'Copy link'"
          class="h-9 flex-none whitespace-nowrap"
          @click="copy(store.formUrl)"
        />
      </div>
      <a
        :href="store.formUrl"
        target="_blank"
        rel="noopener"
        class="flex h-9 items-center gap-1.5 self-start rounded-md border border-grey-300 px-3 text-sm font-semibold text-grey-700 hover:border-grey-400 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >Open form <span aria-hidden="true">↗</span
        ><span class="sr-only">&nbsp;(opens in a new tab)</span></a
      >
      <p class="text-xs text-grey-600">
        Every change you make goes live at once.
      </p>
      <div role="separator" class="h-px bg-grey-200"></div>
      <button
        type="button"
        class="-ml-2 h-9 self-start rounded-md px-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        :disabled="isBusy"
        @click="unpublish"
      >
        Unpublish…
      </button>
    </PopoverPanel>
  </Popover>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
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

// only the editor loads the blocks, the other pages fetch them for the check
const fetched = ref<FormBlockModel[] | null>(null);
const checks = computed(() => {
  const blocks = store.blocks ?? fetched.value;
  return blocks ? publishCheck(blocks) : null;
});

const openCheck = async () => {
  hasFailed.value = false;
  hasCheckFailed.value = false;
  isChecking.value = true;

  if (!store.blocks && store.formId) {
    try {
      fetched.value = (await callGetFormBlocks(store.formId)).data;
    } catch {
      hasCheckFailed.value = true;
    }
  }
};

const publish = async () => {
  isBusy.value = true;
  hasFailed.value = false;

  try {
    await store.publishForm();
    isChecking.value = false;
  } catch {
    hasFailed.value = true;
  }

  isBusy.value = false;
};

const { copy, copied } = useClipboard({ legacy: true });

const unpublish = async () => {
  if (
    window.confirm(
      "Are you sure you want to unpublish this form? People will no longer be able to submit to it.",
    )
  ) {
    isBusy.value = true;
    await store.unpublishForm();
    isBusy.value = false;
  }
};
</script>
