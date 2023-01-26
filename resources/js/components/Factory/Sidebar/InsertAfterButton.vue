<template>
  <div class="absolute inset-x-0 bottom-0 top-0 flex justify-center">
    <button
      class="absolute inset-x-0 bottom-[4px] rounded-full leading-none opacity-0 transition-opacity duration-150 hover:opacity-100"
      @click="store.createFormBlock(block)"
    >
      <D9Icon class="bg-grey-50 text-grey-400" name="plus-circle" />
    </button>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { useForm } from "@/stores";

const store = useForm();

defineProps<{
  block: FormBlockModel;
}>();
</script>
