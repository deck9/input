<template>
  <div>
    <AvatarUpload class="mb-4" />

    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Brand Color" />
        <div class="relative">
          <D9Input class="pl-16" type="text" v-model="brandColor" block />
          <label class="absolute inset-y-2 left-2 w-10 cursor-pointer">
            <input class="invisible" type="color" v-model="brandColor" />
            <span
              class="border-1 absolute inset-0 block h-7 rounded border border-grey-600/25 bg-clip-border shadow"
              :style="`background-color: ${brandColor}`"
            ></span>
          </label>
          <button
            v-if="isSupported"
            type="button"
            class="absolute inset-y-2 right-2 h-7 w-7 rounded-full hover:bg-grey-200"
            @click="openPicker"
          >
            <D9Icon size="xs" name="eyedropper" />
          </button>
        </div>
      </div>

      <D9Button type="submit" label="Save Colors" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input, D9Icon } from "@deck9/ui";
import { ref, watch } from "vue";
import { useEyeDropper } from "@vueuse/core";
import AvatarUpload from "./partials/AvatarUpload.vue";

const store = useForm();
const isSaving = ref(false);

const brandColor = ref(store?.form?.brand_color);
const { isSupported, open, sRGBHex } = useEyeDropper();

const openPicker = () => {
  open();
};

watch(sRGBHex, (value) => {
  brandColor.value = value;
});

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    brand_color: brandColor.value,
  });

  isSaving.value = false;
};
</script>
