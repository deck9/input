<template>
  <div id="row-end-screen" class="relative flex items-start">
    <div class="flex w-8 shrink-0 justify-end pr-2 pt-3 sm:w-12">
      <span class="flex h-6 items-center text-grey-500">
        <D9Icon name="flag" aria-hidden="true" />
      </span>
    </div>

    <!-- the public form then skips the end screen -->
    <div
      v-if="store.form?.use_cta_redirect"
      class="min-h-14 min-w-0 flex-1 px-3 py-2.5 text-sm text-grey-700"
    >
      <p class="break-words">
        <span class="font-medium text-grey-900">No end screen:</span>
        people go to {{ store.form.cta_link }}
      </p>
      <Link :href="settingsLink" class="text-xs text-grey-600 underline"
        >Change in Settings</Link
      >
    </div>

    <div
      v-else-if="isOpen"
      class="touch-fields min-w-0 flex-1 space-y-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-blue-500 sm:p-4"
      @focusout="leave"
    >
      <div class="flex items-center gap-3">
        <label for="end-screen-headline" class="sr-only"
          >End screen headline</label
        >
        <input
          id="end-screen-headline"
          v-model="draft.eoc_headline"
          type="text"
          dir="auto"
          placeholder="Form Submitted"
          class="-ml-2 min-w-0 flex-1 border-0 border-l-2 border-transparent bg-transparent p-0 pl-1.5 text-base font-medium text-grey-900 placeholder:font-normal placeholder:italic placeholder:text-grey-600 focus:border-blue-500 focus:ring-0"
        />
        <span
          class="shrink-0 rounded bg-grey-100 px-1.5 text-xs leading-5 text-grey-700"
          >End screen</span
        >
      </div>

      <div>
        <span id="end-screen-text-label" class="sr-only">End screen text</span>
        <Editor id="end-screen-text" v-model="draft.eoc_text" bare />
      </div>

      <div class="space-y-3 border-t border-grey-200 pt-3">
        <div class="flex items-center gap-2">
          <label for="end-screen-button" class="text-sm text-grey-700">
            Button
          </label>
          <D9Switch
            id="end-screen-button"
            v-model="draft.show_cta_link"
            label="Button"
          />
          <Link
            :href="settingsLink"
            class="ml-auto inline-flex min-h-11 items-center text-xs text-grey-600 underline hover:text-grey-900 lg:min-h-0"
            >Also in Settings</Link
          >
        </div>
        <div v-if="draft.show_cta_link" class="grid gap-3 sm:grid-cols-2">
          <div>
            <D9Label id="end-screen-button-label" label="Button text" />
            <D9Input
              id="end-screen-button-label"
              v-model="draft.cta_label"
              type="text"
              placeholder="Close"
              block
            />
          </div>
          <div>
            <D9Label id="end-screen-button-link" label="Link" />
            <D9Input
              id="end-screen-button-link"
              v-model="draft.cta_link"
              type="url"
              placeholder="https://"
              block
            />
          </div>
        </div>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="min-h-14 min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left hover:bg-grey-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      @click="open"
    >
      <span class="flex items-start gap-2">
        <span
          dir="auto"
          class="line-clamp-2 min-w-0 flex-1 break-words text-base"
          :class="
            store.form?.eoc_headline
              ? 'font-medium text-grey-900'
              : 'font-normal italic text-grey-600'
          "
          ><span class="sr-only">End screen:&nbsp;</span
          >{{ store.form?.eoc_headline || "Form Submitted · default" }}</span
        >
        <span
          aria-hidden="true"
          class="shrink-0 rounded bg-grey-100 px-1.5 text-xs leading-5 text-grey-700"
          >End screen</span
        >
      </span>
      <span
        v-if="text"
        dir="auto"
        class="mt-1 line-clamp-2 break-words text-sm text-grey-700"
        >{{ text }}</span
      >
      <span v-if="hasButton" class="mt-1 block text-xs text-grey-600"
        >Button: {{ store.form?.cta_label || "Close" }}</span
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, watch } from "vue";
import { Link } from "@inertiajs/vue3";
import { D9Icon, D9Input, D9Label, D9Switch } from "@deck9/ui";
import { useEventListener } from "@vueuse/core";
import debounce from "lodash/debounce";
import { useForm, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import { keepAlive } from "@/api/handler";
import Editor from "@/components/Factory/Shared/Editor.vue";
import { freshFormLoaded, trackFormSave } from "@/utils/useFreshForm";
import { plainText } from "./questionSummary";
import { endScreenOpen } from "./blockFocus";

const store = useForm();
const workbench = useWorkbench();
const notice = useNotice();

// shared, so the preview shows the end screen while it's open
const isOpen = endScreenOpen;

const settingsLink = computed(
  () =>
    `${window.route("forms.settings", { uuid: store.form?.uuid })}#completion-page`,
);
const text = computed(() => plainText(store.form?.eoc_text ?? null));
// the public form shows the button only with a link
const hasButton = computed(
  () => store.form?.show_cta_link && store.form?.cta_link,
);

const fields = [
  "eoc_headline",
  "eoc_text",
  "show_cta_link",
  "cta_label",
  "cta_link",
] as const;

const saved = () => ({
  eoc_headline: store.form?.eoc_headline ?? "",
  eoc_text: store.form?.eoc_text ?? "",
  show_cta_link: store.form?.show_cta_link ?? false,
  cta_label: store.form?.cta_label ?? "",
  cta_link: store.form?.cta_link ?? "",
});

const draft = reactive(saved());

const SAVE = "saveEndScreen";
// a Retry can run after you opened another form
const formUuid = store.form?.uuid;
// true while the page closes: the save must outlive it
let isLeaving = false;

// sends what differs from the saved form, so a refused value is sent again
// until it's fixed, also by Retry
const sendChanges = async () => {
  if (store.form?.uuid !== formUuid) {
    return;
  }

  const before = saved();
  const changes = Object.fromEntries(
    fields
      .filter((key) => draft[key] !== before[key])
      .map((key) => [key, draft[key]]),
  );

  if (!Object.keys(changes).length) {
    return;
  }

  const config = isLeaving ? keepAlive(changes) : undefined;
  // the next page may load before this lands: it loads the form again after
  await trackFormSave(store.updateForm(changes, config));
};

const save = debounce(() => notice.send(SAVE, sendChanges), 1000);

watch(draft, () => {
  notice.waitForSave(SAVE);
  save();
});

// save before a click on a link can load the next page, also "Also in Settings" in the card
const leave = (event: FocusEvent) => {
  const card = event.currentTarget as HTMLElement;
  const next = event.relatedTarget as HTMLElement | null;

  if (!card.contains(next) || next?.closest("a")) {
    save.flush();
  }
};

// browser Back moves no focus; the old page stays until the next one has loaded
useEventListener(window, "popstate", () => save.flush());

// a reload or a closed tab within the pause would drop the change
const saveOnLeave = () => {
  isLeaving = true;

  try {
    save.flush();
  } finally {
    isLeaving = false;
  }
};

useEventListener(window, "pagehide", saveOnLeave);
useEventListener(window, "beforeunload", saveOnLeave);

const open = async () => {
  workbench.clearWorkbench();
  // a change made before it closed may still be on its way
  await save.flush();
  await freshFormLoaded();
  Object.assign(draft, saved());
  isOpen.value = true;

  await nextTick();
  document.getElementById("end-screen-headline")?.focus();
};

// one card is open at a time
watch(
  () => workbench.block,
  (block) => {
    if (block) {
      save.flush();
      isOpen.value = false;
    }
  },
);

// the page cleared the form before this unmounts: a later save would go to the next page's form
onBeforeUnmount(() => {
  save.cancel();
  delete notice.waitingSaves[SAVE];
  isOpen.value = false;
});
</script>
