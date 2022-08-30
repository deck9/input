<template>
  <div>
    <D9Label v-bind="{ label }" />

    <div class="mt-2 flex items-center space-x-2">
      <div
        class="flex h-16 w-32 items-center justify-center overflow-hidden rounded bg-grey-200"
      >
        <img
          v-if="imageUrl"
          class="block h-full w-full bg-white object-contain"
          :src="imageUrl"
        />
        <div v-else class="text-sm text-grey-600">max 4MB</div>
      </div>
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
        @click="deleteImage"
        :is-loading="isDeleting"
        :is-disabled="isDeleting"
      />
    </div>
    <ValidationErrors
      v-if="uploadErrors.length > 0"
      class="mb-2"
      :errors="uploadErrors"
    />
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label } from "@deck9/ui";
import ValidationErrors from "@/components/ValidationErrors.vue";
import { computed, Ref, ref } from "vue";
import { AxiosError } from "axios";

const props = defineProps<{
  label: string;
  type: ImageType;
}>();

const store = useForm();
const uploadInput = ref(null) as unknown as Ref<HTMLElement>;
const isSelecting = ref(false);
const isDeleting = ref(false);
const uploadErrors = ref<string[]>([]);

// computed property to retrieve the image url base on the type
const imageUrl = computed(() => {
  if (!store.form) return false;

  return store.form[props.type] ?? false;
});

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
      await store.changeFormImage(file, props.type);
    } catch (error) {
      if (error instanceof AxiosError) {
        uploadErrors.value = [error.response?.data?.message || "Unknown error"];
      }
    }
  }
};

const deleteImage = async () => {
  isDeleting.value = true;

  await store.removeFormImage(props.type);

  isDeleting.value = false;
};
</script>
