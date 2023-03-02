<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />
    <div class="relative rounded-md border-dashed px-4 py-3" :class="cardStyle">
      <h1 class="mb-3 font-bold text-grey-400">Group</h1>
      <div
        class="absolute right-3 top-4 hover:opacity-100"
        :class="isActive ? 'opacity-100' : 'opacity-25'"
      >
        <D9Menu
          class="text-grey-400"
          position="right"
          :use-portal="true"
          :key="`${block.sequence}-position-menu`"
        >
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
            label="Delete"
            @click.stop="deleteBlock"
          />
        </D9Menu>
      </div>
      <BlockContainer :groupId="block.uuid" class="transition duration-200" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BlockContainer from "@/components/Factory/Sidebar/BlockContainer.vue";
import InsertAfterButton from "./InsertAfterButton.vue";
import copy from "copy-text-to-clipboard";
import { D9Menu, D9MenuLink } from "@deck9/ui";
import { useActiveCard } from "@/utils/useActiveCard";
import { useWorkbench, useForm } from "@/stores";
import { ref } from "vue";

const props = defineProps<{
  block: FormBlockModel;
}>();

const workbench = useWorkbench();
const store = useForm();

const isActive = ref(false);
const { cardStyle } = useActiveCard(isActive);

const deleteBlock = () => {
  let result = window.confirm(
    "Do you really want to delete this group? All blocks inside this group will be deleted as well."
  );

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
