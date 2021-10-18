<template>
  <div>
    <D9Label class="mb-2" label="Your Message" />
    <div>
      <textarea
        ref="messageInput"
        rows="1"
        class="appearance-none px-4 py-3 rounded bg-white text-xl w-full p-0 border-0 resize-y focus:outline-none focus:ring-0"
        @input="updateMessage"
      >{{ workbench.block?.message }}</textarea>
    </div>
  </div>
</template>


<script setup lang="ts">
import { D9Label } from '@deck9/ui';
import autosize from "autosize";
import { Ref, onMounted, ref } from 'vue';
import { useWorkbench } from "@/stores";

const messageInput = ref(null) as unknown as Ref<Element>
const workbench = useWorkbench()

onMounted(() => {
  autosize(messageInput.value)
})

const updateMessage = (event: Event) => {
  const update = (event.target as HTMLInputElement).value

  workbench.updateBlock({
    message: update
  });
}
</script>
