<template>
  <div>
    <div class="mb-4">
      <D9Label label="Avatar Image" />
      <div class="flex items-center space-x-4">
        <div
          class="h-24 w-24 rounded-full bg-blue-50 border-2 border-blue-100"
        ></div>
        <D9Button
          label="Upload"
          @click="initUpload"
          :is-disabled="isSelecting"
          :is-loading="isSelecting"
        ></D9Button>
        <input type="file" class="hidden" ref="upload" @change="selectFiles" />
        <D9Button label="Remove" color="dark"></D9Button>
      </div>
    </div>

    <div class="mb-4">
      <D9Label label="Name" />
      <D9Input type="text" block />
    </div>

    <div class="mb-4">
      <D9Label label="Description" />
      <D9Input type="text" block />
    </div>

    <D9Button label="Save Options" />
  </div>
</template>

<script setup lang="ts">
import { D9Button, D9Label, D9Input } from "@deck9/ui";
import { Ref, ref } from "vue";

const upload = ref(null) as unknown as Ref<HTMLElement>;
const isSelecting = ref(false);

const initUpload = () => {
  isSelecting.value = true;
  upload.value?.click();

  setTimeout(() => {
    isSelecting.value = false;
  }, 2000);
};

const selectFiles = (payload: Event) => {
  console.log("select", payload);
};
</script>
