<template>
  <form role="search" class="relative" @submit.prevent>
    <label :for="id" class="sr-only">Search forms</label>
    <span
      aria-hidden="true"
      class="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-grey-500"
    >
      <D9Icon name="magnifying-glass" />
    </span>
    <D9Input
      :id="id"
      ref="input"
      type="search"
      block
      placeholder="Search forms"
      autocomplete="off"
      class="!pl-9 max-md:h-11"
      :modelValue="query"
      @update:modelValue="query = String($event ?? '')"
      @keydown.esc="query = ''"
    />
    <!-- the "/" shortcut needs a keyboard, so phones don't show it -->
    <kbd
      v-if="!query"
      aria-hidden="true"
      class="pointer-events-none absolute right-2.5 top-1/2 z-10 hidden -translate-y-1/2 rounded border border-grey-300 bg-grey-50 px-1.5 font-sans text-xs leading-5 text-grey-500 md:block"
      >/</kbd
    >
  </form>
</template>

<script setup lang="ts">
import { D9Icon, D9Input } from "@deck9/ui";
import { ref, useId } from "vue";
import { useEventListener } from "@vueuse/core";

const query = defineModel<string>({ required: true });

const id = useId();
const input = ref<InstanceType<typeof D9Input> | null>(null);

// "/" jumps to the search, unless someone is typing or a dialog is open
useEventListener(document, "keydown", (event: KeyboardEvent) => {
  const target = event.target;
  if (
    event.key !== "/" ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    (target instanceof Element &&
      target.closest(
        "input, textarea, select, [contenteditable], [role=dialog], [role=alertdialog]",
      ))
  ) {
    return;
  }

  event.preventDefault();
  input.value?.focus();
});
</script>
