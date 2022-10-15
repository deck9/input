<template>
  <div class="flex items-center">
    <div
      v-show="!hideNavigation"
      class="grid w-24 grid-cols-4 rounded border border-grey-200 text-grey-800"
      :class="{ 'pointer-events-none opacity-50': store.isSubmitted }"
    >
      <button
        type="button"
        class="inline-flex items-center justify-center border-r border-grey-100 py-1 hover:bg-grey-100"
        :aria-label="t('Previous')"
        @click="store.back()"
      >
        <D9Icon icon="chevron-left" />
      </button>
      <span class="col-span-2 inline-block whitespace-nowrap py-1 font-medium">
        <span>{{ currentPage }}</span>
      </span>
      <button
        type="button"
        class="inline-flex items-center justify-center border-l border-grey-100 py-1 hover:bg-grey-100"
        :aria-label="t('Next')"
        @click="!store.isLastBlock ? store.next() : false"
      >
        <D9Icon icon="chevron-right" />
      </button>
    </div>
    <ProgressIndicator
      v-if="store.form?.show_form_progress"
      class="ml-2"
      :progress="progress"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { useConversation } from "@/stores/conversation";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ProgressIndicator from "@/forms/classic/layout/ProgressIndicator.vue";

const { t } = useI18n();

defineProps<{
  hideNavigation?: boolean;
}>();

const store = useConversation();

const totalPages = computed(() => {
  return store.queue?.length ?? 0;
});

const currentPage = computed(() => {
  return store.current + 1;
});

const progress = computed(() => {
  return Math.round((store.current / totalPages.value) * 100);
});
</script>
