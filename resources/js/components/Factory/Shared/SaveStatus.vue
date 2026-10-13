<template>
  <!-- sits in the dark top bar; under xl only the icons show, as in the board.
    Under lg the red save bar has Retry and stays while a save failed -->
  <div class="flex items-center justify-end gap-1 text-xs text-grey-400">
    <!-- keeps its width while empty, so the top bar doesn't move on each save:
      the icon under xl, "Saving…" from xl -->
    <p
      role="status"
      aria-live="polite"
      class="flex min-w-3.5 items-center justify-end gap-1.5 xl:min-w-[4.25rem]"
      :title="words[shown]"
    >
      <template v-if="shown === 'saving'">
        <svg
          aria-hidden="true"
          class="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M21 12a9 9 0 1 1-6.2-8.6" />
        </svg>
        <span class="sr-only xl:not-sr-only">Saving…</span>
      </template>
      <template v-else-if="shown === 'saved'">
        <svg
          aria-hidden="true"
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
        <span class="sr-only xl:not-sr-only">Saved</span>
      </template>
      <span
        v-else-if="shown === 'failed'"
        class="flex items-center gap-1 font-medium text-red-300"
      >
        <svg
          aria-hidden="true"
          class="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"
          />
        </svg>
        <span class="sr-only xl:not-sr-only">Not saved</span>
      </span>
    </p>
    <button
      v-if="shown === 'failed' && notice.canRetry"
      type="button"
      class="hidden h-6 rounded px-1 font-medium text-blue-300 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:block"
      @click="notice.retrySaves()"
    >
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useNotice } from "@/stores/notice";

const notice = useNotice();

// "Saved" shows for 2 seconds after a save worked, then nothing
const justSaved = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => notice.saveStatus,
  (now, before) => {
    clearTimeout(timer);
    justSaved.value = before === "saving" && now === "idle";

    if (justSaved.value) {
      timer = setTimeout(() => (justSaved.value = false), 2000);
    }
  },
);

onBeforeUnmount(() => clearTimeout(timer));

const shown = computed(() => (justSaved.value ? "saved" : notice.saveStatus));

// a tooltip for the icon alone under xl
const words: Record<typeof shown.value, string | undefined> = {
  saving: "Saving…",
  saved: "Saved",
  failed: "Not saved",
  idle: undefined,
};
</script>
