<template>
  <div class="w-48">
    <D9Select
      block
      v-model="sortSetting"
      :options="options"
      icon="chevron-right"
    />
  </div>
</template>

<script lang="ts" setup>
import { D9Select } from "@deck9/ui";
import { ref, watch } from "vue";

const props = defineProps<{
  sort: SortSetting;
}>();

const emit = defineEmits<{
  (event: "changeSort", value: SortSetting): void;
}>();

const options = ref([
  { label: "Name", value: "name:asc", icon: "arrow-up-1-9" },
  { label: "Created At", value: "created_at:desc", icon: "calendar" },
  { label: "Updated At", value: "updated_at:desc", icon: "pencil" },
]);

const sortSetting = ref(
  options.value.find((option) => {
    return option.value === props.sort;
  }) ?? options.value[0],
);

watch(sortSetting, (value) => {
  emit("changeSort", value.value as SortSetting);
});
</script>
