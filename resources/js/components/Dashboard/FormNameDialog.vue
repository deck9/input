<template>
  <DialogModal
    :show="show"
    max-width="md"
    :closeable="!isSaving"
    @close="emit('close')"
  >
    <template #title>{{ title }}</template>
    <template #content>
      <form @submit.prevent="submit">
        <D9Label :id="inputId" :label="label" />
        <D9Input
          :id="inputId"
          ref="input"
          v-model="name"
          class="mt-1"
          block
          :placeholder="placeholder"
          maxlength="255"
          autocomplete="off"
        />
      </form>
    </template>
    <template #footer>
      <D9Button
        label="Cancel"
        color="light"
        class="!bg-white hover:!bg-blue-100"
        :isDisabled="isSaving"
        @click="emit('close')"
      />
      <D9Button
        class="ml-2"
        :label="confirmLabel"
        :isLoading="isSaving"
        @click="submit"
      />
    </template>
  </DialogModal>
</template>

<script setup lang="ts">
import { D9Button, D9Input, D9Label } from "@deck9/ui";
import { nextTick, ref, useId, watch } from "vue";
import DialogModal from "@/Jetstream/DialogModal.vue";

const props = defineProps<{
  show: boolean;
  title: string;
  label: string;
  confirmLabel: string;
  defaultName: string;
  placeholder?: string;
  isSaving?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  submit: [name: string];
}>();

const inputId = useId();
const name = ref("");
const input = ref<InstanceType<typeof D9Input> | null>(null);
let opener: HTMLElement | null = null;

watch(
  () => props.show,
  async (show) => {
    if (!show) {
      opener?.focus();
      return;
    }

    opener = document.activeElement as HTMLElement | null;
    name.value = props.defaultName;

    await nextTick();
    input.value?.focus();
  },
);

const submit = () => {
  if (!props.isSaving) {
    emit("submit", name.value.trim());
  }
};
</script>
