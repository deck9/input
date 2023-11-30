<template>
  <div class="relative">
    <label class="sr-only block" :for="action.id">{{ action.label }}</label>
    <input
      type="date"
      class="block w-full max-w-xs rounded border border-content/20 bg-background brightness-user px-3 py-2 pl-10 text-content focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      :name="block.id"
      :id="action.id"
      :placeholder="action.label || t('Choose a date')"
      :value="storeValue"
      :min="action.options?.noPastDates ? todayDate : action.options?.minDate"
      :max="action.options?.maxDate"
      ref="inputElement"
      autocomplete="off"
      @input="onInput"
      v-once
    />

    <div class="absolute inset-y-0 left-3 flex items-center text-content/50">
      <D9Icon name="calendar" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, inject, onMounted, ref } from "vue";
import { D9Icon } from "@deck9/ui";
import { useConversation } from "@/stores/conversation";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const store = useConversation();

const props = defineProps<{
  block: PublicFormBlockModel;
  action: PublicFormBlockInteractionModel;
}>();
const disableFocus: ComputedRef<boolean> | undefined = inject("disableFocus");

const storeValue = (store.currentPayload as FormBlockInteractionPayload)
  ?.payload;
const inputElement = ref<HTMLInputElement | null>(null);

onMounted(() => {
  if (!disableFocus?.value) {
    inputElement.value?.focus();
  }
});

const todayDate = new Date().toISOString().substring(0, 10);

const onInput = () => {
  const input = inputElement.value?.value ?? null;
  store.setResponse(props.action, input);
};
</script>
