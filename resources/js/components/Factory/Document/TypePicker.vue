<template>
  <section
    ref="root"
    :aria-labelledby="`${id}-title`"
    class="scroll-mt-4 rounded-lg border border-grey-200 bg-white p-2 shadow-md"
    @keydown.esc.prevent="emit('close')"
  >
    <p
      :id="`${id}-title`"
      ref="heading"
      tabindex="-1"
      class="px-2 pb-2 pt-1 text-base font-semibold text-grey-900 outline-none lg:text-sm"
    >
      {{ title }}
    </p>
    <div class="relative">
      <D9Icon
        name="magnifying-glass"
        aria-hidden="true"
        class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-grey-600"
      />
      <input
        ref="search"
        v-model="filter"
        type="text"
        role="combobox"
        aria-label="Find an answer type"
        aria-autocomplete="list"
        aria-expanded="true"
        :aria-controls="`${id}-list`"
        :aria-activedescendant="active ? `${id}-${active}` : undefined"
        placeholder="Find an answer type"
        autocomplete="off"
        class="h-11 w-full rounded-md border border-grey-300 pl-9 pr-3 text-base text-grey-900 placeholder:text-grey-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 lg:h-9 lg:text-sm"
        @keydown="onKey"
        @focus="typing = true"
        @blur="typing = false"
      />
    </div>

    <div
      :id="`${id}-list`"
      role="listbox"
      aria-label="Answer types"
      class="mt-1 sm:columns-2 sm:gap-2"
    >
      <div
        v-for="group in groups"
        :key="group.label"
        role="group"
        :aria-label="group.label"
        class="break-inside-avoid"
      >
        <p
          aria-hidden="true"
          class="px-2 pb-1 pt-2 text-xs font-medium text-grey-600"
        >
          {{ group.label }}
        </p>
        <div
          v-for="type in group.types"
          :id="`${id}-${type.value}`"
          :key="type.value"
          role="option"
          :aria-selected="type.value === active"
          class="flex h-11 cursor-pointer items-center gap-2.5 rounded-md px-2 text-base text-grey-900 hover:bg-grey-100 lg:h-9 lg:text-sm"
          :class="
            type.value === active && typing && 'ring-2 ring-inset ring-blue-500'
          "
          @click="emit('pick', type.value)"
        >
          <D9Icon
            :name="type.icon"
            aria-hidden="true"
            class="w-4 shrink-0 text-grey-600"
          />
          {{ type.label }}
        </div>
      </div>
    </div>
    <p v-if="!flat.length" class="px-2 py-3 text-sm text-grey-600">
      No answer type matches “{{ filter.trim() }}”
    </p>

    <p
      aria-hidden="true"
      class="mt-1 hidden border-t border-grey-100 px-2 pb-0.5 pt-2 text-xs text-grey-600 lg:block"
    >
      ↑↓ to move · Enter to add · Esc to close
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from "vue";
import { onClickOutside, useMediaQuery } from "@vueuse/core";
import { D9Icon } from "@deck9/ui";
import {
  typeGroups,
  useBlockTypes,
} from "@/components/Factory/utils/useBlockTypes";

const { autofocus = true } = defineProps<{
  title: string;
  // the empty form shows it at once: the view and the cursor stay where they are
  autofocus?: boolean;
}>();

const emit = defineEmits<{ pick: [type: FormBlockType]; close: [] }>();

const id = useId();
const { types } = useBlockTypes();
const root = ref<HTMLElement | null>(null);
const heading = ref<HTMLElement | null>(null);
const search = ref<HTMLInputElement | null>(null);
// the highlight shows only while you type: Enter adds it
const typing = ref(false);
const isLarge = useMediaQuery("(min-width: 1024px)");
const filter = ref("");

const groups = computed(() => {
  const needle = filter.value.trim().toLowerCase();

  return typeGroups
    .map((group) => ({
      label: group.label,
      types: group.types
        .map((value) => types.value.find((type) => type.value === value)!)
        .filter((type) => type.label.toLowerCase().includes(needle)),
    }))
    .filter((group) => group.types.length);
});

const flat = computed(() =>
  groups.value.flatMap((group) => group.types.map((type) => type.value)),
);

// the highlighted type, which Enter adds
const index = ref(0);
const active = computed(() => flat.value[index.value]);
watch(filter, () => (index.value = 0));

const onKey = (event: KeyboardEvent) => {
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    index.value = Math.min(
      Math.max(index.value + step, 0),
      flat.value.length - 1,
    );
    document
      .getElementById(`${id}-${active.value}`)
      ?.scrollIntoView?.({ block: "nearest" });
  } else if (event.key === "Enter") {
    event.preventDefault();

    if (active.value) {
      emit("pick", active.value);
    }
  }
};

onClickOutside(root, () => emit("close"));

onMounted(() => {
  if (!autofocus) {
    return;
  }

  // a phone shows the list from its top: it never fits the screen
  root.value?.scrollIntoView?.({ block: isLarge.value ? "nearest" : "start" });
  // below lg the screen keyboard would cover the list
  (isLarge.value ? search : heading).value?.focus({ preventScroll: true });
});
</script>
