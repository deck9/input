<template>
  <div>
    <D9Label label="Avatar Image" />
    <div class="flex items-center space-x-4">
      <img
        class="
          h-24
          w-24
          rounded-lg
          bg-blue-50
          border-2 border-blue-100
          overflow-hidden
          object-cover object-center
        "
        v-if="store?.form?.avatar"
        :src="store.form.avatar"
      />
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
