<template>
  <div>
    <D9Label label="Brand Image" />
    <img
      class="my-2 block h-16 overflow-hidden rounded bg-white object-cover px-4 py-2"
      v-if="store?.form?.avatar"
      :src="store.form.avatar"
    />
    <div class="flex items-center space-x-4">
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
import { Ref, ref } from "vue";

const store = useForm();
const uploadInput = ref(null) as unknown as Ref<HTMLElement>;
const isSelecting = ref(false);
const isDeleting = ref(false);

const initUpload = () => {
  isSelecting.value = true;
  uploadInput.value?.click();

  setTimeout(() => {
    isSelecting.value = false;
  }, 2000);
};

const selectFiles = (payload: Event) => {
  const files = (payload?.target as HTMLInputElement).files;

  if (files && files.length > 0) {
    const file = files[0];
    store.changeAvatar(file);
  }
};

const deleteAvatar = async () => {
  isDeleting.value = true;

  await store.removeAvatar();

  isDeleting.value = false;
};
</script>
