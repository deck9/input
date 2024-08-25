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
      drag-handle-selector="button.handle"
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

    <div class="mt-2">
      <D9Button
        label="Add new option"
        icon="plus"
        icon-position="left"
        color="dark"
        :isLoading="isCreatingInteraction"
        @click="createClickInteraction"
      />
    </div>

    <RandomizeResponsesSetting class="my-4" />

    <CustomResponseSettings
      v-if="
        editableInteractions &&
        editableInteractions.length > 0 &&
        workbench.block &&
        ['radio', 'checkbox'].includes(workbench.block.type)
      "
      class=""
    />
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
import CustomResponseSettings from "./Interactions/CustomResponseSettings.vue";
import RandomizeResponsesSetting from "./Interactions/RandomizeResponsesSetting.vue";

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
