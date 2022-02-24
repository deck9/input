<template>
  <div>
    <div
      v-if="workbench.currentInteractions?.length === 0"
      class="font-heading bg-grey-200 text-grey-700 mb-4 block rounded px-4 py-3"
    >
      Nothing here yet.
      <small class="block font-sans text-sm"
        >Add your first option by clicking on the button below.</small
      >
    </div>

    <Container
      lock-axis="y"
      drag-handle-selector="button.handle"
      orientation="vertical"
      @drop="onDrop"
    >
      <Draggable
        v-for="(item, index) in workbench.currentInteractions"
        :key="item.id"
      >
        <ClickInteraction
          v-bind="{ item, index, multiple: workbench.isMultipleChoice }"
        />
      </Draggable>
    </Container>

    <div class="mt-4">
      <D9Button
        label="Add new option"
        icon="plus"
        icon-position="left"
        color="dark"
        @click="createClickInteraction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button } from "@deck9/ui";
import { ref } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";

const workbench = useWorkbench();

const onDrop = ({ removedIndex, addedIndex }: any): void => {
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  workbench.changeInteractionSequence(removedIndex, addedIndex);
};

const isCreatingInteraction = ref(false);

const createClickInteraction = async () => {
  isCreatingInteraction.value = true;

  try {
    await workbench.createInteraction("click");
  } catch (error) {
    console.warn(error);
  } finally {
    isCreatingInteraction.value = false;
  }
};
</script>
