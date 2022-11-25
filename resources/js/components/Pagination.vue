<template>
  <nav
    class="flex items-center justify-between border-grey-200 py-3"
    aria-label="Pagination"
  >
    <div class="hidden sm:block">
      <p class="text-sm text-grey-700">
        Showing
        <span class="font-medium">{{ meta.from }}</span>
        to
        <span class="font-medium">{{ meta.to }}</span>
        of
        <span class="font-medium">{{ meta.total }}</span>
        results
      </p>
    </div>
    <div
      v-if="meta.last_page > 1"
      class="flex flex-1 justify-between gap-2 sm:justify-end"
    >
      <D9Button
        label="Previous"
        @click="emit('previous')"
        color="dark"
        :isDisabled="meta.current_page === 1"
      />
      <D9Button
        @click="emit('next')"
        label="Next"
        color="dark"
        :isDisabled="meta.current_page === meta.last_page"
      />
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { D9Button } from "@deck9/ui";

defineProps<{
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: PaginateLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}>();

const emit = defineEmits<{
  (event: "next"): void;
  (event: "previous"): void;
}>();
</script>
