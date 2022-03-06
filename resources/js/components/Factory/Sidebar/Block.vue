<template>
  <div class="relative my-6 text-sm first-of-type:mt-0">
    <div class="absolute inset-x-0 -bottom-6 top-0 flex justify-center">
      <button
        class="absolute inset-x-0 bottom-[4px] rounded-full leading-none opacity-0 transition-opacity duration-150 hover:opacity-100"
        @click="store.createFormBlock(block)"
      >
        <D9Icon class="bg-grey-50 text-grey-400" name="plus-circle" />
      </button>
    </div>
    <button
      class="group relative block w-full cursor-pointer overflow-visible rounded-md px-6 py-4 text-left shadow-sm"
      :class="cardStyle"
      @click="workbench.putOnWorkbench(block)"
    >
      <div
        class="absolute right-3 top-4 hover:opacity-100"
        :class="isActive ? 'opacity-100' : 'opacity-25'"
      >
        <D9Menu class="text-grey-400" position="right" :use-portal="true">
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            :meta="block.uuid"
            label="Copy ID"
            @click="copyId"
          />
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            :disabled="block.type === 'consent'"
            label="Delete"
            @click.stop="deleteBlock"
          />
        </D9Menu>
      </div>

      <div class="relative mt-3 flex items-start">
        <div class="flex w-full pr-4">
          <ConsentBlockMessage v-if="block.type === 'consent'" />
          <div
            v-else-if="block.message"
            class="prose prose-sm mb-2"
            v-html="block.message"
          />
          <div v-else class="mb-2 font-light text-grey-400">--no message--</div>
        </div>
      </div>

      <BlockInteraction
        v-for="(interaction, index) in activeInteractions"
        v-bind="{ interaction, index }"
        :key="interaction.id"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import ConsentBlockMessage from "./ConsentBlockMessage.vue";
import BlockInteraction from "./BlockInteraction.vue";
import { useWorkbench, useForm } from "@/stores";
import { D9Menu, D9MenuLink, D9Icon } from "@deck9/ui";
import copy from "copy-text-to-clipboard";
import useActiveInteractions from "../Shared/useActiveInteractions";
import { useActiveCard } from "@/utils/useActiveCard";

const workbench = useWorkbench();
const store = useForm();

const props = defineProps<{
  block: FormBlockModel;
}>();

provide("block", props.block);

const { activeInteractions } = useActiveInteractions(props.block);

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});

const { cardStyle } = useActiveCard(isActive);

const deleteBlock = () => {
  let result = window.confirm("Do you really want to delete this snippet?");

  if (result) {
    store.deleteFormBlock(props.block);

    if (workbench.block?.id === props.block.id) {
      workbench.clearWorkbench();
    }
  }
};

const copyId = () => {
  copy(props.block.uuid);
};
</script>
