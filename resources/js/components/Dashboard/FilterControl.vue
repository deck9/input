<template>
  <div class="w-40">
    <D9Select block v-model="filterSetting" :options="options" />
  </div>
</template>

<script lang="ts" setup>
import { D9Select } from "@deck9/ui";
import { ref, watch } from "vue";

const props = defineProps<{
  filter: FilterSetting;
}>();

const emit = defineEmits<{
  (event: "changeFilter", setting: FilterSetting): void;
}>();

const options = ref([
  { label: "No filter", value: null },
  { label: "Published", value: "published" },
  { label: "Unpublished", value: "unpublished" },
  { label: "Deleted", value: "trashed" },
]);

const filterSetting = ref(
  options.value.find((option) => {
    return option.value === props.filter;
  }) ?? options.value[0],
);

watch(filterSetting, (value) => {
  emit("changeFilter", value.value as FilterSetting);
});
</script>
