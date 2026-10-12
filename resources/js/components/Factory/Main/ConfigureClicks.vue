<template>
  <div>
    <EmptyState
      v-if="editableInteractions?.length === 0"
      title="Nothing here yet."
      description="Add your first option by clicking on the button below."
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
          @onDelete="focusNeighborItem"
        />
      </Draggable>
    </Container>

    <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
      <D9Button
        label="Add new option"
        class="min-h-11 sm:min-h-0"
        icon="plus"
        icon-position="left"
        color="dark"
        :isLoading="isCreatingInteraction"
        @click="createClickInteraction"
      />
      <span class="text-xs text-grey-600">Enter adds a choice.</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button } from "@deck9/ui";
import { ref, nextTick } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import EmptyState from "@/components/EmptyState.vue";
import { useKeyboardNavigation } from "@/components/Factory/utils/useKeyboardNavigation";
import useActiveInteractions from "../Shared/useActiveInteractions";

const workbench = useWorkbench();
const { activeInteractions, editableInteractions } = useActiveInteractions(
  workbench.block,
);

const isCreatingInteraction = ref(false);

const onDrop = ({ removedIndex, addedIndex }: any): void => {
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  workbench.changeInteractionSequence(removedIndex, addedIndex);
};

const createClickInteraction = async () => {
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

const {
  bindTemplateRefsForTraversables,
  focusNextItem,
  focusNextItemSoft,
  focusPreviousItem,
  focusLastItem,
  focusNeighborItem,
} = useKeyboardNavigation(activeInteractions, async () => {
  await createClickInteraction();
});
</script>
