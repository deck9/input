<template>
  <RadioGroup v-model="selectedMailingLists">
    <div class="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
      <RadioGroupOption
        as="template"
        v-for="mailingList in mailingLists"
        :key="mailingList.id"
        :value="mailingList.value"
        v-slot="{ checked, active }"
      >
        <div
          :class="[
            checked ? 'border-transparent' : 'border-gray-300',
            active ? 'border-blue-600 ring-2 ring-blue-600' : '',
            'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none',
          ]"
        >
          <span class="flex flex-1">
            <span class="flex flex-col">
              <RadioGroupLabel
                as="span"
                class="text-gray-900 block text-sm font-medium"
                >{{ mailingList.title }}</RadioGroupLabel
              >
              <RadioGroupDescription
                as="span"
                class="text-gray-500 mt-1 flex items-center text-sm"
                >{{ mailingList.description }}</RadioGroupDescription
              >
            </span>
          </span>
          <D9Icon
            name="check-circle"
            :class="[!checked ? 'invisible' : '', 'h-5 w-5 text-blue-600']"
            aria-hidden="true"
          />
          <span
            :class="[
              active ? 'border' : 'border-2',
              checked ? 'border-blue-600' : 'border-transparent',
              'pointer-events-none absolute -inset-px rounded-lg',
            ]"
            aria-hidden="true"
          />
        </div>
      </RadioGroupOption>
    </div>
  </RadioGroup>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import {
  RadioGroup,
  RadioGroupDescription,
  RadioGroupLabel,
  RadioGroupOption,
} from "@headlessui/vue";
import { D9Icon } from "@deck9/ui";

const mailingLists = [
  {
    id: 1,
    title: "Show completion page",
    description: "Configure a custom completion page",
    value: false,
  },
  {
    id: 2,
    title: "Redirect to URL",
    description: "Automatically redirect to a URL after form submission",
    value: true,
  },
];

const props = defineProps<{
  modelValue?: boolean;
}>();

const emits = defineEmits<{
  (event: "update:modelValue", value: boolean): void;
}>();

const selectedMailingLists = ref(props.modelValue ?? false);

watch(selectedMailingLists, (value) => {
  emits("update:modelValue", value);
});
</script>
