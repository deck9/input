<template>
  <div>
    <div class="md:hidden">
      <D9Label :id="id" label="Status" class="sr-only" />
      <!-- at 360 px the texts need the room: a wider list, less padding; 44 px to tap -->
      <D9Select
        :id="id"
        class="[&_[role=listbox]]:w-max [&_[role=listbox]]:min-w-full [&_button]:h-11 [&_button]:!pl-3 [&_button]:!pr-8"
        :modelValue="options.find((option) => option.id === status)"
        :options="options"
        @update:modelValue="emit('changeStatus', $event.id as StatusSetting)"
      />
    </div>
    <div
      role="group"
      aria-label="Status"
      class="hidden gap-1 rounded-lg bg-grey-100 p-1 text-sm font-medium text-grey-600 md:flex"
    >
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="flex h-[34px] items-center gap-1.5 rounded-md px-3 transition-colors"
        :class="
          option.id === status
            ? 'bg-white text-grey-900 shadow-sm'
            : 'hover:text-grey-900'
        "
        :aria-pressed="option.id === status"
        @click="emit('changeStatus', option.id)"
      >
        {{ option.name }}
        <span
          v-if="option.count !== undefined"
          class="font-normal tabular-nums text-grey-600"
          >{{ option.count.toLocaleString() }}</span
        >
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Label, D9Select } from "@deck9/ui";
import { computed, useId } from "vue";

const props = defineProps<{
  status: StatusSetting;
  // none while the list loads
  counts?: { all: number; published: number; unpublished: number };
}>();

const emit = defineEmits<{
  changeStatus: [status: StatusSetting];
}>();

const id = useId();

// archived forms load only when chosen, so they have no count
const options = computed(() =>
  (
    [
      ["all", "All", props.counts?.all],
      ["published", "Published", props.counts?.published],
      ["unpublished", "Unpublished", props.counts?.unpublished],
      ["archived", "Archived", undefined],
    ] as const
  ).map(([id, name, count]) => ({
    id,
    name,
    count,
    // the select on phones shows one text
    label: count === undefined ? name : `${name} ${count.toLocaleString()}`,
  })),
);
</script>
