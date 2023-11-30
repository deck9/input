<template>
  <div class="relative">
    <label class="sr-only block" :for="action.id">{{ action.label }}</label>
    <input
      :type="nativeInputType"
      class="block w-full max-w-xs rounded border border-content/20 bg-background brightness-user px-3 py-2 text-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :class="[
        {
          'pl-16': useSymbol,
          'pl-10': useIcon && !useSymbol,
          'pl-3': !useSymbol && !useIcon,
        },
        block.type === 'input-number' ? 'text-right ' : 'text-left',
      ]"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || 'Enter text'"
      :value="storeValue"
      :step="stepValue"
      :inputmode="inputMode"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
      maxlength="100"
      v-once
    />

    <CharCount
      v-if="block.type === 'input-short'"
      v-bind="{
        text: inputText,
        maxChars: 100,
      }"
    />

    <div
      class="absolute inset-y-px left-px flex w-12 items-center justify-center rounded bg-content/10 text-sm font-medium"
      v-if="useSymbol"
    >
      {{ useSymbol }}
    </div>
    <div
      v-else-if="useIcon"
      class="absolute inset-y-0 left-3 flex items-center text-grey-700"
    >
      <D9Icon :name="useIcon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, inject, onMounted, ref } from "vue";
import { D9Icon } from "@deck9/ui";
import { useConversation } from "@/stores/conversation";
import { useFixedNumberFormatting } from "@/utils/useFixedNumberFormatting";
import CharCount from "@/components/CharCount.vue";

const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

let storeValue = ref(
  (store.currentPayload as FormBlockInteractionPayload)?.payload,
);

// if we restore a value from the store, we need to format it
if (props.block.type === "input-number" && storeValue.value) {
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: props.action.options?.decimalPlaces,
    maximumFractionDigits: props.action.options?.decimalPlaces,
  });

  storeValue.value = formatter.format(storeValue.value);
}

const inputElement = ref<HTMLInputElement | null>(null);
const inputText = ref<string | undefined>(inputElement.value?.value);
const stepValue = 1 / Math.pow(10, props.action.options?.decimalPlaces ?? 0);
const useSymbol = ref(props.action.options?.useSymbol ?? false);

// get the input element type based on the action type
const nativeInputType = computed(() => {
  const action: FormBlockType = props.block.type;

  switch (action) {
    case "input-email":
      return "email";

    case "input-link":
      return "url";

    case "input-phone":
      return "tel";

    case "input-secret":
      return "password";

    default:
      return "text";
  }
});

const inputMode = computed(() => {
  const action: FormBlockType = props.block.type;

  switch (action) {
    case "input-number":
      if (
        props.action.options?.decimalPlaces &&
        props.action.options?.decimalPlaces > 0
      ) {
        return "decimal";
      } else {
        return "numeric";
      }

    default:
      return undefined;
  }
});

const useIcon = computed(() => {
  switch (props.block.type) {
    case "input-number":
      return "sort-numeric-up";

    case "input-email":
      return "envelope";

    case "input-link":
      return "link";

    case "input-phone":
      return "phone";

    default:
      return false;
  }
});

onMounted(() => {
  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

const onInput = (event) => {
  if (!inputElement.value) {
    return;
  }

  let input: string | number | null = inputElement.value.value;

  inputText.value = input;

  if (input && props.block.type === "input-number") {
    const { output } = useFixedNumberFormatting(event, {
      decimalPlaces: props.action.options?.decimalPlaces ?? 0,
    });
    input = output.value;
  }

  store.setResponse(props.action, input);
};
</script>
