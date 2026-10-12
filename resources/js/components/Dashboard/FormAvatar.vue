<template>
  <img
    v-if="form.avatar"
    :src="form.avatar"
    alt=""
    class="h-8 w-8 shrink-0 rounded-full object-cover outline outline-1 -outline-offset-1 outline-black/10 lg:h-10 lg:w-10"
  />
  <div
    v-else
    aria-hidden="true"
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold lg:h-10 lg:w-10 lg:text-base"
    :style="{
      backgroundColor: form.brand_color ?? '#232323',
      color: form.contrast_color ?? undefined,
    }"
  >
    {{ initial }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  form: FormModel;
}>();

// one whole character, so an emoji or an accented letter isn't split
const initial = computed(() => {
  const [first] = new Intl.Segmenter().segment(props.form.name);
  const grapheme = first?.segment ?? "";
  const upper = grapheme.toUpperCase();

  // "ß" turns into "SS": keep the one character
  return [...upper].length === [...grapheme].length ? upper : grapheme;
});
</script>
