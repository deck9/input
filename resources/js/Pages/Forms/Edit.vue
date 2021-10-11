<template>
  <app-layout title="Edit Form">
    <div class="py-12">
      <Storyboard />
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
