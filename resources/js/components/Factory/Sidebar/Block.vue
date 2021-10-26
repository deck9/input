<template>
  <button
    class="
      relative
      block
      w-full
      text-left
      cursor-pointer
      px-6
      py-4
      group
      overflow-visible
    "
    @click="workbench.putOnWorkbench(block)"
  >
    <div
      class="treeline w-1 bg-grey-200 absolute top-6 left-[42px] -bottom-4"
    ></div>

    <div class="absolute right-3 top-4 z-10 opacity-0 group-hover:opacity-100">
      <D9Menu class="text-grey-500" position="right" :use-portal="true">
        <div class="flex w-full px-4 py-3 text-xs space-between">
          <div class="w-full">ID</div>
          <div class="font-bold">{{ block.uuid }}</div>
        </div>
        <D9MenuLink
          as="button"
          class="block w-full text-left"
          @click="copyId"
          label="Copy ID"
        />
        <D9MenuLink
          as="button"
          class="block w-full text-left"
          @click.stop="deleteBlock"
          :disabled="block.type === 'consent'"
          label="Delete"
        />
      </D9Menu>
    </div>

    <div class="flex items-start relative">
      <div
        class="
          mt-px
          mr-4
          flex-shrink-0
          py-1
          w-10
          text-center
          font-black
          text-xs
          rounded-sm
          transition
          duration-150
        "
        :class="
          isActive ? 'bg-blue-300' : 'bg-grey-200 group-hover:bg-yellow-300'
        "
      >
        {{ romanSequence }}
      </div>

      <div class="flex w-full pr-4 font-medium">
        <ConsentBlockMessage v-if="block.type === 'consent'" />
        <div
          class="mb-2"
          v-else-if="block.message"
          v-html="block.message"
        ></div>
        <div v-else class="mb-2 text-grey-400 font-light">--Empty--</div>
      </div>
    </div>

    <BlockInteraction
      v-bind="{ interaction, index }"
      :key="interaction.id"
      v-for="(interaction, index) in activeInteractions"
    />
  </button>
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
