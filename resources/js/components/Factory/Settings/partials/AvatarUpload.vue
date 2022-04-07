<template>
  <div>
    <D9Label label="Brand Image" />
    <img
      class="my-2 block h-16 overflow-hidden rounded bg-white object-cover px-4 py-2"
      v-if="store?.form?.avatar"
      :src="store.form.avatar"
    />
    <div class="text-grey-500 text-sm" v-else> max 4MB </div>
    <ValidationErrors
      v-if="uploadErrors.length > 0"
      class="mb-2"
      :errors="uploadErrors"
    />
    <div class="mt-2 flex items-center space-x-4">
      <D9Button
        label="Upload"
        @click="initUpload"
        :is-disabled="isSelecting"
        :is-loading="isSelecting"
      />
      <input
        type="file"
        class="hidden"
        ref="uploadInput"
        @change="selectFiles"
      />
      <D9Button
        label="Remove"
        color="dark"
        @click="deleteAvatar"
        :is-loading="isDeleting"
        :is-disabled="isDeleting"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label } from "@deck9/ui";
import ValidationErrors from "@/components/ValidationErrors.vue";
import { Ref, ref } from "vue";
import { AxiosError } from "axios";

const store = useForm();
const uploadInput = ref(null) as unknown as Ref<HTMLElement>;
const isSelecting = ref(false);
const isDeleting = ref(false);
const uploadErrors = ref<string[]>([]);

const initUpload = () => {
  isSelecting.value = true;
  uploadInput.value?.click();

  setTimeout(() => {
    isSelecting.value = false;
  }, 2000);
};

const selectFiles = async (payload: Event) => {
  const files = (payload?.target as HTMLInputElement).files;

  if (files && files.length > 0) {
    const file = files[0];
    try {
      await store.changeAvatar(file);
    } catch (error) {
      uploadErrors.value = [
        (error as AxiosError).response?.data?.message || "Unknown error",
      ];
    }
  }
};

const deleteAvatar = async () => {
  isDeleting.value = true;

  await store.removeAvatar();

  isDeleting.value = false;
};
</script>
