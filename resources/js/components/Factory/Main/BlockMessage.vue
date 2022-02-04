<template>
  <div>
    <h2 class="mb-2 text-base font-bold">Your Message</h2>
    <div>
      <textarea
        ref="messageInput"
        rows="1"
        class="w-full resize-y appearance-none rounded border-0 bg-white p-0 px-4 py-3 text-xl focus:outline-none focus:ring-0"
        @input="updateMessage"
        :value="workbench.block?.message ?? ''"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import autosize from "autosize";
import { Ref, onMounted, ref } from "vue";
import { useWorkbench } from "@/stores";

const messageInput = ref(null) as unknown as Ref<Element>;
const workbench = useWorkbench();

onMounted(() => {
  autosize(messageInput.value);
});

const updateMessage = (event: Event) => {
  const update = (event.target as HTMLInputElement).value;

  workbench.updateBlock({
    message: update,
  });
};
</script>
