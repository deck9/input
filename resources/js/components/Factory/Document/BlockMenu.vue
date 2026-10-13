<template>
  <D9Menu
    position="left"
    :use-portal="true"
    class="[&>button:focus-visible]:ring-2 [&>button:focus-visible]:ring-blue-500 [&>button]:rounded-md"
  >
    <template #button>
      <span
        class="grid h-11 w-11 place-items-center rounded-md border border-grey-300 lg:h-9 lg:w-9 bg-white text-grey-700 hover:bg-grey-100"
      >
        <D9Icon name="ellipsis-h" />
        <span class="sr-only">{{ label }}</span>
      </span>
    </template>

    <D9MenuLink
      v-if="!isGroup"
      as="button"
      :class="item"
      label="Duplicate"
      @click="duplicateBlock(block)"
    />
    <D9MenuLink
      v-if="isGroup"
      as="button"
      :class="item"
      label="Add question to this group"
      @click="emit('addToGroup')"
    />
    <D9MenuLink
      v-else
      as="button"
      :class="item"
      label="Add question below"
      @click="addBlock(block)"
    />
    <D9MenuLink
      v-if="isGroup"
      as="button"
      :class="item"
      :label="block.is_disabled ? 'Show group' : 'Hide group'"
      @click="toggleHidden"
    />
    <D9MenuLink
      as="button"
      :class="item"
      label="Move up"
      :disabled="!canMove(block, -1)"
      @click="moveBlock(block, -1)"
    />
    <D9MenuLink
      as="button"
      :class="item"
      label="Move down"
      :disabled="!canMove(block, 1)"
      @click="moveBlock(block, 1)"
    />
    <D9MenuLink
      as="button"
      :class="item"
      :label="isGroup ? 'Copy group ID' : 'Copy question ID'"
      @click="copy(block.uuid)"
    />
    <D9MenuLink
      as="button"
      :class="[item, 'text-red-700']"
      :label="isGroup ? 'Delete group…' : 'Delete…'"
      @click="ask"
    />
  </D9Menu>

  <DeleteBlockDialog
    v-bind="{ block, check }"
    @close="cancel"
    @confirm="deleteBlock"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Icon, D9Menu, D9MenuLink } from "@deck9/ui";
import copy from "copy-text-to-clipboard";
import { useForm, useWorkbench } from "@/stores";
import DeleteBlockDialog from "@/components/Factory/Shared/DeleteBlockDialog.vue";
import { useDeleteBlock } from "@/components/Factory/Shared/useDeleteBlock";
import { blocksAround, focusRow, useAddBlock } from "./blockFocus";
import { useMoveBlock } from "./blockMove";

const props = defineProps<{
  block: FormBlockModel;
  label: string;
}>();

const emit = defineEmits<{ addToGroup: [] }>();

const store = useForm();
const workbench = useWorkbench();
const { addBlock, duplicateBlock } = useAddBlock();
const { canMove, moveBlock } = useMoveBlock();

const item = "w-full min-h-11 text-left text-sm lg:min-h-0";
const isGroup = computed(() => props.block.type === "group");

// the open block saves through the workbench: a store save swaps its object, and its next save would send the old value
const toggleHidden = () => {
  const hidden = !props.block.is_disabled;

  if (workbench.block?.id === props.block.id) {
    workbench.updateBlock({ is_disabled: hidden });
  } else {
    store.updateFormBlockProperty(props.block, "is_disabled", hidden);
  }
};

const { check, ask, cancel, confirm } = useDeleteBlock(props.block);

// focus never falls to the page: the next row, else the one before, else Add question
const deleteBlock = async () => {
  const near = blocksAround(props.block);
  await confirm();

  const left = new Set((store.blocks ?? []).map((item) => item.id));
  // a failed delete keeps the block: back to its row
  const target = left.has(props.block.id)
    ? props.block
    : near.find((item) => left.has(item.id));

  if (!target || !(await focusRow(target))) {
    document.querySelector<HTMLElement>("#add-buttons button")?.focus();
  }
};
</script>
