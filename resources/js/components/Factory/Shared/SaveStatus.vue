<template>
  <div class="flex items-center justify-end gap-1 text-xs text-grey-600">
    <p role="status" aria-live="polite" class="flex items-center gap-1.5">
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
        <span>Saving…</span>
      </template>
      <template v-else-if="shown === 'saved'">
        <svg
          aria-hidden="true"
          class="h-3.5 w-3.5 text-green-700"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12l5 5L20 7" />
        </svg>
        <span>Saved</span>
      </template>
      <span
        v-else-if="shown === 'failed'"
        class="flex items-center gap-1 font-medium text-red-700"
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
        Not saved
      </span>
    </p>
    <button
      v-if="shown === 'failed' && notice.canRetry"
      type="button"
      class="h-6 rounded px-1 font-medium text-blue-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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
</script>
