<template>
  <div>
    <pre>{{ action.options.color }}</pre>
    <div class="flex gap-1" @mouseleave="hoverValue = false">
      <button
        v-for="(option, index) in ratingOptions"
        :key="'rate-' + index"
        :data-index="index"
        type="button"
        @mouseover="hoverValue = index"
        @click="onInput(index)"
        @dblclick="onInput(false)"
      >
        <D9Icon
          :name="action.options.icon ?? 'star'"
          size="xl"
          class="custom-range-theme"
          :class="[
            action.options.color ? 'text-range' : 'text-primary',
            hoverValue !== false && hoverValue >= index
              ? 'opacity-100'
              : hoverValue === false &&
                selectedValue !== false &&
                selectedValue >= index
              ? 'opacity-100'
              : 'opacity-10',
          ]"
        />
        <span class="sr-only">{{ option.value }}</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { onKeyStroke } from "@vueuse/core";
import { useConversation } from "@/stores/conversation";
import { D9Icon } from "@deck9/ui";
import { useThemableColor } from "@/utils/useThemableColor";

const store = useConversation();

const props = defineProps<{
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const ratingOptions = computed(() => {
  let current = props.action.options?.start ?? 1;
  const end = props.action.options?.end ?? 5;
  const options: { value: number }[] = [];

  for (current; current <= end; current++) {
    options.push({ value: current });
  }

  return options;
});

const selectedValue = computed(() => {
  if (Array.isArray(store.currentPayload)) {
    return false;
  }

  if (!store.currentPayload?.payload) {
    return false;
  }

  const searchValue = store.currentPayload.payload;

  return ratingOptions.value.findIndex((option) => {
    return option.value === searchValue;
  });
});

const hoverValue = ref<number | false>(false);

const onInput = (index) => {
  if (index === false) {
    if (props.block.is_required) {
      return;
    }

    store.setResponse(props.action, false);
    hoverValue.value = false;
  } else {
    let adjustedIndex = index;

    if (adjustedIndex >= ratingOptions.value.length - 1) {
      adjustedIndex = ratingOptions.value.length - 1;
    }

    store.setResponse(props.action, ratingOptions.value[adjustedIndex].value);
  }
};

const tempInput = ref("");

onKeyStroke(
  ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  (e) => {
    e.preventDefault();

    setTimeout(() => (tempInput.value = ""), 500);
    tempInput.value += e.key;

    onInput(Number(tempInput.value) - 1);
  },
  {
    target: document,
  }
);

const rangeColor = useThemableColor(props.action?.options.color ?? "#000000");
</script>

<style>
.custom-range-theme {
  --color-range: v-bind(rangeColor);
}
</style>
