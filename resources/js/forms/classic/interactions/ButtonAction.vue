<template>
  <label
    v-if="isVisible"
    :for="action.id"
    class="relative block cursor-pointer rounded border py-2 pl-6 pr-3 bg-background brightness-user"
    :class="{
      'border-primary ring-1 ring-primary': isChecked,
      'border-content/20': !isChecked,
    }"
  >
    <div class="absolute inset-y-0 left-2 flex items-center">
      <span
        data-testid="button-action-index"
        class="flex h-5 w-5 items-center justify-center rounded-sm text-xs font-medium"
        :class="{
          'bg-primary text-contrast': isChecked,
          'bg-content/70 text-background': !isChecked,
        }"
        >{{ index + 1 }}</span
      >
    </div>

    <span class="block w-full pl-4 pr-6">
      <input
        v-if="isOtherOption"
        ref="otherInput"
        @click="startEditing(true)"
        @blur="stopEditing($event)"
        @keydown.enter="stopEditing($event, true)"
        type="text"
        :placeholder="
          isChecked && !otherValue
            ? t('Type your answer')
            : action.label ?? t('Other')
        "
        v-model="otherValue"
        class="block w-full border-0 focus:ring-0"
        :class="{ 'pointer-events-none': !isChecked }"
      />
      <span v-else class="inline-block" data-testid="button-label">{{
        action.label
      }}</span>
      <div
        v-if="isOtherOption"
        class="absolute inset-y-0 right-12 flex items-center whitespace-nowrap text-sm"
      >
        <template v-if="otherValue !== '' && isChecked && !isMobileDevice">
          <i18n-t
            v-if="!store.isInputMode"
            keypath="hints.edit"
            tag="span"
            scope="global"
          >
            <code class="rounded bg-content/10 px-1 py-px">e</code>
          </i18n-t>
          <i18n-t v-else keypath="hints.confirm" tag="span" scope="global">
            <code class="rounded bg-content/10 px-1 py-px">Enter</code>
          </i18n-t>
        </template>
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
import { onKeyStroke } from "@vueuse/core";
import { onMounted, ref, computed, ComputedRef, inject } from "vue";
import { useConversation } from "@/stores/conversation";
import { useMobileDetection } from "@/utils/useMobileDetection";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const store = useConversation();

const props = defineProps<{
  index: number;
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();

const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");
const buttonElement = ref<HTMLInputElement | null>(null);
const otherInput = ref<HTMLInputElement | null>(null);
const otherValue = ref<string>("");
const inputType = props.block.type === "checkbox" ? "checkbox" : "radio";
const shortcutKey = (props.index + 1).toString();

const { isMobileDevice } = useMobileDetection();

const isChecked = computed<boolean>(() => {
  if (Array.isArray(store.currentPayload)) {
    return (
      store.currentPayload.findIndex(
        (value) => value.actionId === props.action.id,
      ) !== -1
    );
  } else {
    return props.action.id === store.currentPayload?.actionId;
  }
});

const isOtherOption = computed<boolean>(() => {
  return props.action.name === "alt_response";
});

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
    // focus the input field
    otherInput.value?.focus();

    // switch into editing mode
    store.enableInputMode();
  }
};

const saveInput = () => {
  const responseValue = isOtherOption.value
    ? otherValue.value
    : props.action.label;

  buttonElement.value?.focus();
  if (inputType === "checkbox") {
    store.toggleResponse(props.action, responseValue);
  } else {
    store.setResponse(props.action, responseValue);
  }
};

// On Input is called when user clicks on the button and the response is selected
const onInput = (event: Event | null = null) => {
  if (store.isInputMode) {
    return;
  }

  if (event && isOtherOption.value) {
    event.preventDefault();
  }

  saveInput();

  if (isOtherOption.value && !store.isInputMode && otherValue.value === "") {
    startEditing();
  }
};

const stopEditing = (event: Event, focusButton = false) => {
  event.preventDefault();
  event.stopPropagation();

  // only stop if input mode was on
  if (!store.isInputMode) {
    return;
  }

  // disable input mode
  store.disableInputMode();

  // update the value stored for the action
  saveInput();

  if (focusButton) {
    // focus the checkbox input, so navigation is possible
    buttonElement.value?.focus();
  }
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
      { target: document },
    );
  }
}

if (isOtherOption.value) {
  if (!Array.isArray(store.currentPayload)) {
    otherValue.value = store.currentPayload?.payload ?? "";
  }
}
</script>
