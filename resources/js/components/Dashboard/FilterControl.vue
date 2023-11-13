<template>
  <div>
    <Label class="mr-2" v-show="filter" color="grey">
      {{ filter }}
      <button @click="emit('changeFilter', null)">
        <D9Icon name="close" />
      </button>
    </Label>
    <Popover class="relative inline-block">
      <PopoverButton
        class="relative mr-2 inline-flex items-center rounded-lg border-transparent bg-grey-100 px-5 py-2 text-sm font-medium leading-4 text-blue-600 ring-blue-300 ring-offset-2 transition duration-150 ease-in-out hover:bg-blue-100 hover:text-blue-700 focus:outline-none focus:ring active:bg-grey-100 active:ring dark:ring-offset-grey-900"
      >
        Filter
        <D9Icon class="-mr-1 ml-3 text-blue-600" name="filter" />
      </PopoverButton>
      <PopoverPanel
        v-slot="{ close }"
        class="absolute z-10 flex flex-col items-stretch rounded bg-grey-50 px-1 py-2 text-grey-700 shadow-lg"
      >
        <button
          class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
          type="button"
          @click="clickFilter('published', close)"
        >
          Published
        </button>
        <button
          class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
          type="button"
          @click="clickFilter('unpublished', close)"
        >
          Unpublished
        </button>
        <button
          class="block rounded px-3 py-1 text-left font-medium hover:bg-grey-200"
          type="button"
          @click="clickFilter('trashed', close)"
        >
          Trashed
        </button>
      </PopoverPanel>
    </Popover>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import Label from "@/components/Label.vue";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";

defineProps<{
  filter: FilterSetting;
}>();

const emit = defineEmits<{
  (event: "changeFilter", setting: FilterSetting): void;
}>();

const clickFilter = (setting: FilterSetting, close: any) => {
  emit("changeFilter", setting);
  close();
};
</script>
