<template>
  <div class="flex items-center gap-2">
    <D9Label
      :id="id"
      label="Sort by"
      class="sr-only shrink-0 text-sm text-grey-600 md:not-sr-only"
    />
    <D9Select
      :id="id"
      class="w-full md:w-48 [&_[role=listbox]]:right-0 [&_[role=listbox]]:w-max [&_[role=listbox]]:min-w-full max-md:[&_button]:h-11 max-md:[&_button]:!pl-3 max-md:[&_button]:!pr-7"
      :modelValue="options.find((option) => option.id === sort)"
      :options="options"
      @update:modelValue="emit('changeSort', $event.id as SortSetting)"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Label, D9Select } from "@deck9/ui";
import { useId } from "vue";

defineProps<{
  sort: SortSetting;
}>();

const emit = defineEmits<{
  changeSort: [sort: SortSetting];
}>();

const id = useId();

const options: { id: SortSetting; label: string }[] = [
  { id: "latest", label: "Latest submission" },
  { id: "edited", label: "Recently edited" },
  { id: "newest", label: "Newest first" },
  { id: "name", label: "Name A–Z" },
];
</script>
