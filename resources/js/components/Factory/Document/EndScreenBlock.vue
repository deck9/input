<template>
  <div id="row-end-screen" class="flex items-start">
    <div class="flex w-12 shrink-0 justify-end pr-2 pt-3">
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
      class="min-w-0 flex-1 space-y-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-blue-500 sm:p-4"
      @focusout="leave"
    >
      <div class="flex items-center justify-between gap-3">
        <span class="rounded bg-grey-100 px-1.5 text-xs leading-5 text-grey-700"
          >End screen</span
        >
        <Link
          :href="settingsLink"
          class="text-xs text-grey-600 underline hover:text-grey-900"
          >Also in Settings</Link
        >
      </div>

      <div>
        <D9Label id="end-screen-headline" label="Headline" />
        <D9Input
          id="end-screen-headline"
          v-model="draft.eoc_headline"
          type="text"
          block
        />
      </div>

      <div>
        <D9Label
          id="end-screen-text"
          label="Text"
          @click="textEditor?.focus()"
        />
        <Editor
          id="end-screen-text"
          ref="textEditor"
          v-model="draft.eoc_text"
        />
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
            onLabel="Yes"
            offLabel="No"
          />
        </div>
        <div v-if="draft.show_cta_link" class="grid gap-3 sm:grid-cols-2">
          <div>
            <D9Label id="end-screen-button-label" label="Label" />
            <D9Input
              id="end-screen-button-label"
              v-model="draft.cta_label"
              type="text"
              block
            />
          </div>
          <div>
            <D9Label id="end-screen-button-link" label="Link" />
            <D9Input
              id="end-screen-button-link"
              v-model="draft.cta_link"
              type="url"
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
          >{{ store.form?.eoc_headline || "No headline yet" }}</span
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
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { Link } from "@inertiajs/vue3";
import { D9Icon, D9Input, D9Label, D9Switch } from "@deck9/ui";
import { useEventListener } from "@vueuse/core";
import debounce from "lodash/debounce";
import { useForm, useWorkbench } from "@/stores";
import { useNotice } from "@/stores/notice";
import Editor from "@/components/Factory/Shared/Editor.vue";
import { plainText } from "./questionSummary";

const store = useForm();
const workbench = useWorkbench();
const notice = useNotice();

const isOpen = ref(false);
const textEditor = ref<InstanceType<typeof Editor> | null>(null);

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

// sends what differs from the saved form, so a refused value is sent again until it's fixed
const save = debounce(async () => {
  const before = saved();
  const changes = Object.fromEntries(
    fields
      .filter((key) => draft[key] !== before[key])
      .map((key) => [key, draft[key]]),
  );

  if (!Object.keys(changes).length) {
    return;
  }

  try {
    await store.updateForm(changes);
    notice.clearSaveError("saveEndScreen");
  } catch (error) {
    notice.showSaveError(error, "saveEndScreen");
  }
}, 1000);

watch(draft, () => save());

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

const open = async () => {
  workbench.clearWorkbench();
  // a change made before it closed may still be on its way
  await save.flush();
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
onBeforeUnmount(() => save.cancel());
</script>
