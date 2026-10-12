<template>
  <div class="rounded-lg border border-grey-200 bg-white">
    <!-- each row names its own values, so screen readers skip the header -->
    <div
      aria-hidden="true"
      class="hidden border-b border-grey-200 px-4 py-3.5 text-left text-sm font-semibold text-grey-900 lg:grid lg:grid-cols-[minmax(0,1fr)_8rem_11rem_9rem_7rem] lg:gap-4"
    >
      <div>Name</div>
      <div>Status</div>
      <div>Submissions</div>
      <div>Last edited</div>
      <div></div>
    </div>
    <ul v-if="forms.length" role="list" class="divide-y divide-grey-200">
      <FormListItem
        :form="form"
        :key="form.id"
        v-for="form in forms"
        @announce="announce"
      />
    </ul>
    <!-- what to show instead of rows: loading or no match -->
    <slot v-else />
    <!-- the live region stays in the page, so a new message is read out -->
    <div
      role="status"
      class="pointer-events-none fixed inset-x-4 bottom-6 z-50 flex justify-center"
    >
      <div
        v-if="toast"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-4 rounded-lg bg-grey-900 px-4 py-3 text-sm text-white shadow-lg"
        @focusin="stopTimer"
        @focusout="startTimer"
        @mouseenter="stopTimer"
        @mouseleave="startTimer"
      >
        <span class="[overflow-wrap:anywhere]">{{ toast.text }}</span>
        <button
          v-if="toast.copy"
          type="button"
          class="-my-3 -mr-2 shrink-0 rounded px-2 py-3 font-semibold text-blue-300 hover:text-white"
          @click="toast.copy"
        >
          Copy link
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormListItem from "@/components/Dashboard/FormListItem.vue";
import { ref } from "vue";
import { useTimeoutFn } from "@vueuse/core";

defineProps<{
  forms: Array<FormModel>;
}>();

const toast = ref<{ id: number; text: string; copy?: () => void } | null>(null);

const { start: startTimer, stop: stopTimer } = useTimeoutFn(
  () => (toast.value = null),
  5000,
  { immediate: false },
);

const announce = (next: { text: string; copy?: () => void }) => {
  toast.value = { ...next, id: (toast.value?.id ?? 0) + 1 };
  startTimer();
};
</script>
