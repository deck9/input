<template>
  <div>
    <EmptyState
      v-if="editableInteractions?.length === 0"
      title="Nothing here yet."
      description="Add your first choice with the button below."
    />

    <Container
      v-else
      lock-axis="y"
      drag-handle-selector=".handle"
      orientation="vertical"
      @drop="onDrop"
    >
      <Draggable v-for="(item, index) in editableInteractions" :key="item.id">
        <ClickInteraction
          v-bind="{ item, index }"
          :key="`${item.id}-${index}`"
          :ref="bindTemplateRefsForTraversables.bind(index)"
          @next="focusNextItem"
          @nextSoft="focusNextItemSoft"
          @previous="focusPreviousItem"
          @onDelete="deleteItem"
          @move="moveItem"
        />
      </Draggable>
    </Container>

    <button
      ref="addButton"
      type="button"
      aria-label="Add choice"
      aria-describedby="add-choice-hint"
      :aria-busy="isCreatingInteraction"
      class="mt-1 flex h-11 w-full items-center gap-2 rounded-md border border-dashed border-grey-300 px-2 text-sm font-medium text-grey-700 hover:border-grey-400 hover:bg-grey-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:h-9"
      @click="createClickInteraction"
    >
      <D9Icon name="plus" aria-hidden="true" />
      Add choice
      <span
        id="add-choice-hint"
        class="ml-auto text-xs font-normal text-grey-600"
        >Enter adds a choice.</span
      >
    </button>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Icon } from "@deck9/ui";
import { ref, nextTick } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import EmptyState from "@/components/EmptyState.vue";
import { useKeyboardNavigation } from "@/components/Factory/utils/useKeyboardNavigation";
import useActiveInteractions from "../Shared/useActiveInteractions";
import {
  announce,
  type Step,
} from "@/components/Factory/Document/blockMove";

const workbench = useWorkbench();
const { editableInteractions } = useActiveInteractions(workbench.block);

const isCreatingInteraction = ref(false);
const addButton = ref<HTMLButtonElement | null>(null);

const onDrop = ({ removedIndex, addedIndex }: any): void => {
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  workbench.changeInteractionSequence(removedIndex, addedIndex);
};

const createClickInteraction = async () => {
  // the button has no disabled state: a second click waits for the first
  if (isCreatingInteraction.value) return;

  isCreatingInteraction.value = true;

  try {
    await workbench.createInteraction("button");

    nextTick(() => {
      focusLastItem();
    });

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  } finally {
    isCreatingInteraction.value = false;
  }
};

const deleteItem = async (index: number) => {
  const item = editableInteractions.value?.[index];
  if (!item) return;

  await workbench.deleteInteraction(item);

  // a failed delete keeps the row, and focus stays in it
  if (editableInteractions.value?.includes(item)) return;

  if (!(await focusNeighborItem(index))) {
    addButton.value?.focus();
  }
};

// Alt+Up/Down moves a choice; focus stays on it
const moveItem = async (index: number, step: Step) => {
  const choices = editableInteractions.value ?? [];
  const item = choices[index];
  const to = index + step;

  if (!item || !choices[to]) {
    announce(step < 0 ? "Already at the top" : "Already at the bottom");
    return;
  }

  workbench.changeInteractionSequence(index, to);
  await nextTick();
  focusItem(item);
  announce(`Moved choice to position ${to + 1} of ${choices.length}`);
};

const {
  bindTemplateRefsForTraversables,
  focusNextItem,
  focusNextItemSoft,
  focusPreviousItem,
  focusLastItem,
  focusNeighborItem,
  focusItem,
} = useKeyboardNavigation(editableInteractions, async () => {
  await createClickInteraction();
});
</script>
