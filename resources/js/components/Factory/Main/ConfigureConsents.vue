<template>
  <div>
    <EmptyState
      v-if="workbench.currentInteractions?.length === 0"
      title="Nothing here yet."
      description="Add your first option by clicking on the button below."
    />

    <Container
      v-else
      lock-axis="y"
      drag-handle-selector="button.handle"
      orientation="vertical"
      @drop="onDrop"
    >
      <Draggable
        v-for="(item, index) in workbench.currentInteractions"
        :key="item.id"
      >
        <ConsentInteraction
          v-bind="{ item, index, multiple: workbench.isCheckboxInput }"
          :key="`${item.id}-${index}`"
          :ref="bindTemplateRefsForTraversables.bind(index)"
          @next="focusNextItem"
          @nextSoft="focusNextItemSoft"
          @previous="focusPreviousItem"
          @delete="focusNeighborItem"
        />
      </Draggable>
    </Container>

    <div class="mt-4">
      <D9Button
        label="Add new option"
        icon="plus"
        icon-position="left"
        color="dark"
        :isLoading="isCreatingInteraction"
        @click="createConsentPolicy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button } from "@deck9/ui";
import { ref, nextTick } from "vue";
import ConsentInteraction from "./Interactions/ConsentInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import EmptyState from "@/components/EmptyState.vue";
import { useKeyboardNavigation } from "@/components/Factory/utils/useKeyboardNavigation";
import { storeToRefs } from "pinia";

const workbench = useWorkbench();
const { currentInteractions } = storeToRefs(workbench);
const isCreatingInteraction = ref(false);

const onDrop = ({ removedIndex, addedIndex }: any): void => {
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  workbench.changeInteractionSequence(removedIndex, addedIndex);
};

const createConsentPolicy = async () => {
  isCreatingInteraction.value = true;

  try {
    await workbench.createInteraction("consent");

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
} = useKeyboardNavigation(currentInteractions, async () => {
  await createConsentPolicy();
});
</script>
