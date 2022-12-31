<template>
  <label
    v-if="isVisible"
    :for="action.id"
    class="relative block cursor-pointer rounded border py-2 pl-6 pr-3"
    :class="{
      'border-primary ring-1 ring-primary': isChecked,
      'border-content/80': !isChecked,
    }"
  >
    <div class="absolute inset-y-0 left-2 flex items-center">
      <span
        class="flex h-5 w-5 items-center justify-center rounded-sm text-xs font-medium"
        :class="{
          'bg-primary text-contrast': isChecked,
          'bg-content/80 text-background': !isChecked,
        }"
        >{{ index + 1 }}</span
      >
    </div>

    <span class="block w-full pl-4 pr-6">
      <input
        v-if="isOtherOption"
        ref="otherInput"
        @blur="stopEditing"
        @keyup.enter="stopEditing"
        @keyup.esc="otherInput?.blur()"
        type="text"
        placeholder="Other"
        v-model="otherValue"
        class="block w-full border-0 focus:ring-0"
        :class="{ 'pointer-events-none': !isChecked }"
      />
      <span v-else class="inline-block">{{ action.label }}</span>
      <div
        v-if="isOtherOption"
        class="absolute inset-y-0 right-12 flex items-center whitespace-nowrap"
      >
        <span v-if="isChecked && !store.isInputMode" class="text-sm"
          >Press <code class="rounded bg-content/10 px-1 py-px">e</code> to
          edit</span
        >
        <span
          v-else-if="isChecked && otherValue !== '' && store.isInputMode"
          class="text-sm"
          >Press <code class="rounded bg-content/10 px-1 py-px">Enter</code> to
          confirm</span
        >
      </div>
    </span>

    <div class="absolute inset-y-0 right-4 flex items-center">
      <input
        class="border-grey-300 bg-transparent checked:border-primary checked:bg-primary checked:hover:bg-primary focus:ring-primary focus:checked:bg-primary focus:checked:outline-none focus:checked:ring-0 focus:checked:ring-offset-0"
        :type="inputType"
        :name="block.id"
        :id="action.id"
        :value="action.label"
        @input="onInput"
        ref="buttonElement"
        :checked="isChecked"
      />
    </div>
  </label>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, inject } from "@vue/runtime-core";
import { onKeyStroke } from "@vueuse/core";
import { onMounted, ref } from "vue";
import { useConversation } from "@/stores/conversation";

const store = useConversation();

const props = defineProps<{
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const emits = defineEmits<{
  (event: "pressedEnterWhileInput"): void;
}>();

const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");
const buttonElement = ref<HTMLInputElement | null>(null);
const otherInput = ref<HTMLInputElement | null>(null);
const inputType = props.block.type === "checkbox" ? "checkbox" : "radio";
const shortcutKey = (props.index + 1).toString();

const isChecked = computed<boolean>(() => {
  if (Array.isArray(store.currentPayload)) {
    return (
      store.currentPayload.findIndex(
        (value) => value.actionId === props.action.id
      ) !== -1
    );
  } else {
    return props.action.id === store.currentPayload?.actionId;
  }
});

const isOtherOption = computed<boolean>(() => {
  return props.action.name === "other_response";
});

const otherValue = ref<string>("");

const isVisible = computed<boolean>(() => {
  return (
    !isOtherOption.value ||
    (isOtherOption.value && props.block.type === "radio")
  );
});

onMounted(() => {
  if (!disableFocus?.value && props.index === 0) {
    buttonElement.value?.focus();
  }
});

const startEditing = (force = false) => {
  if (force || otherValue.value === "") {
    store.enableInputMode();
    otherInput.value?.focus();
  }
};

const onInput = (event: Event | null = null) => {
  if (store.isInputMode) {
    return;
  }

  if (event) {
    event.preventDefault();
  }

  const responseValue = isOtherOption.value
    ? otherValue.value
    : props.action.label;

  buttonElement.value?.focus();
  if (inputType === "checkbox") {
    store.toggleResponse(props.action, responseValue);
  } else {
    store.setResponse(props.action, responseValue);
  }

  if (isOtherOption.value && otherValue.value === "") {
    startEditing();
  }
};

const stopEditing = () => {
  store.disableInputMode();
  onInput();
  emits("pressedEnterWhileInput");
};

if (isVisible.value) {
  onKeyStroke(shortcutKey, onInput, { target: document });

  // add shortcut to edit the value
  if (isOtherOption.value) {
    onKeyStroke(
      "e",
      (e) => {
        if (store.isInputMode) {
          return;
        }

        e.preventDefault();
        startEditing(true);
      },
      { target: document }
    );
  }
}

if (isOtherOption.value) {
  if (!Array.isArray(store.currentPayload)) {
    otherValue.value = store.currentPayload?.payload ?? "";
  }
}
</script>
