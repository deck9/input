<template>
  <app-layout title="Edit Form">
    <div class="grid grid-cols-12 w-full">
      <Storyboard class="col-span-4" />
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue';
import Storyboard from '@/components/Factory/Storyboard.vue';
import { useForm } from '@/stores';

const props = defineProps<{
  form: FormModel
}>()

const store = useForm()

store.$patch({
  form: props.form
})
</script>
