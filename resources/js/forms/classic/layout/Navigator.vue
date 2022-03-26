<template>
  <div
    class="grid w-24 grid-cols-4 rounded border border-grey-200 text-grey-800"
    :class="{ 'pointer-events-none opacity-50': store.isSubmitted }"
  >
    <button
      type="button"
      class="border-r border-grey-100 py-1 hover:bg-grey-100"
      @click="store.back()"
    >
      <D9Icon icon="chevron-left" />
    </button>
    <span class="col-span-2 inline-block whitespace-nowrap py-1 font-medium">
      <span>{{ currentPage }}</span>
      <span v-if="totalPages"> / {{ totalPages }}</span>
    </span>
    <button
      type="button"
      class="border-l border-grey-100 py-1 hover:bg-grey-100"
      @click="!store.isLastBlock ? store.next() : false"
    >
      <D9Icon icon="chevron-right" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { useConversation } from "@/stores/conversation";
import { computed, ref } from "vue";

const store = useConversation();

const totalPages = ref(0);
const currentPage = computed(() => {
  return store.current + 1;
});
</script>
