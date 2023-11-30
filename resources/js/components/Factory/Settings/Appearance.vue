<template>
  <div>
    <ImageUpload class="mb-6" label="Brand Image" type="avatar" />
    <ImageUpload class="mb-6" label="Background Image" type="background" />

    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Brand Color" />
        <D9Input type="color" v-model="brandColor" block show-color-picker />
      </div>

      <div class="mb-4">
        <D9Label label="Background Color" />
        <D9Input
          type="color"
          v-model="backgroundColor"
          block
          show-color-picker
        />
      </div>

      <div class="mb-4">
        <D9Label label="Text Color" />
        <D9Input type="color" v-model="textColor" block show-color-picker />
      </div>

      <div class="mb-4 flex justify-between">
        <D9Label
          label="Brighten Input Fields"
          description="This will brighten up the inputs and is especially desirable for themes with a dark background color."
        />
        <D9Switch
          label="Brighten Input Fields"
          v-model="useBrighterInputs"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <hr class="mb-4 border-grey-200" />

      <div class="mb-4 flex justify-between pb-3">
        <D9Label label="Show Progress Indicator" />
        <D9Switch
          label="Show Progress Indicator"
          v-model="showFormProgress"
          onLabel="yes"
          offLabel="no"
        />
      </div>

      <D9Button type="submit" label="Save Appearance" :is-loading="isSaving" />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input, D9Switch } from "@deck9/ui";
import { ref } from "vue";
import ImageUpload from "./partials/ImageUpload.vue";

const store = useForm();
const isSaving = ref(false);

const brandColor = ref(store?.form?.brand_color);
const backgroundColor = ref(store?.form?.background_color);
const textColor = ref(store?.form?.text_color);

const useBrighterInputs = ref(store?.form?.use_brighter_inputs);
const showFormProgress = ref(store?.form?.show_form_progress);

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    brand_color: brandColor.value,
    background_color: backgroundColor.value,
    text_color: textColor.value,
    show_form_progress: showFormProgress.value,
    use_brighter_inputs: useBrighterInputs.value,
  });

  isSaving.value = false;
};
</script>
