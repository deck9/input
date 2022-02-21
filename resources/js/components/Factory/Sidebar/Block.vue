<template>
  <div class="relative my-4 text-sm first-of-type:mt-0">
    <button
      class="group relative block w-full cursor-pointer overflow-visible rounded-md bg-white bg-opacity-90 px-6 py-4 text-left backdrop-blur-sm"
      :class="{
        'ring-2 ring-blue-500 ring-opacity-50 ring-offset-1': isActive,
      }"
      @click="workbench.putOnWorkbench(block)"
    >
      <div class="absolute right-3 top-4 group-hover:opacity-100">
        <D9Menu class="text-grey-500" position="right" :use-portal="true">
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
          <div v-else-if="block.message" class="mb-2" v-html="block.message" />
          <div v-else class="text-grey-400 mb-2 font-light">--no message--</div>
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
import { computed } from "vue";
import { romanize } from "@/utils";
import ConsentBlockMessage from "./ConsentBlockMessage.vue";
import BlockInteraction from "./BlockInteraction.vue";
import { useWorkbench, useForm } from "@/stores";
import { D9Menu, D9MenuLink } from "@deck9/ui";
import copy from "copy-text-to-clipboard";
import useActiveInteractions from "../Shared/useActiveInteractions";

const workbench = useWorkbench();
const store = useForm();

const props = defineProps<{
  block: FormBlockModel;
}>();

const { activeInteractions } = useActiveInteractions(props.block);

const romanSequence = computed(() => {
  return romanize(props.block.sequence + 1);
});

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});

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
