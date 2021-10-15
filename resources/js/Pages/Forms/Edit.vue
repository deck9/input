<template>
  <app-layout title="Edit Form">
    <div class="grid grid-cols-12 w-full">
      <Storyboard class="col-span-6 lg:col-span-5 xl:col-span-4" />
      <div class="col-span-6 lg:col-span-7 xl:col-span-8">
        <pre>{{ workbench.block }}</pre>
      </div>
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from '@/Layouts/AppLayout.vue';
import Storyboard from '@/components/Factory/Storyboard.vue';
import { useForm, useWorkbench } from '@/stores';

const props = defineProps<{
  form: FormModel
}>()

const store = useForm()
const workbench = useWorkbench()

store.$patch({
  form: props.form
})
</script>
