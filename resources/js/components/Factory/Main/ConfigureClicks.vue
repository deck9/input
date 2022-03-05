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
        <ClickInteraction
          v-bind="{ item, index, multiple: workbench.isCheckboxInput }"
          :key="`${item.id}-${index}`"
          :ref="bindTemplateInputs.bind(index)"
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
        @click="createClickInteraction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button } from "@deck9/ui";
import { Ref, ref, nextTick } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import EmptyState from "@/components/EmptyState.vue";

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

const inputs = ref([]) as unknown as Ref<
  Record<number, typeof ClickInteraction>
>;

const bindTemplateInputs = (el) => {
  if (el && el.item) {
    inputs.value[el.item.id] = el;
  }
};

const focusNextItemSoft = (fromIndex: number) => {
  focusNextItem(fromIndex, false);
};

// choose a next item
const focusNeighborItem = (fromIndex: number) => {
  if (!workbench.currentInteractions) {
    return;
  }

  let targetIndex = fromIndex === 0 ? 0 : fromIndex - 1;
  focusNextItemSoft(targetIndex - 1);
};

const focusNextItem = async (fromIndex: number, create = true) => {
  if (!workbench.currentInteractions) {
    return;
  }

  // get the next item in order
  let destination = workbench.currentInteractions[fromIndex + 1];

  // if there is no next item, create new item and call self again
  if (typeof destination === "undefined") {
    if (!create) {
      return;
    }

    await createClickInteraction();
  } else {
    // if there is a next item, find it in template refs an focus it
    inputs.value[destination.id].focus();
  }
};

const focusPreviousItem = async (fromIndex: number) => {
  if (!workbench.currentInteractions || fromIndex === 0) {
    return;
  }

  let destination = workbench.currentInteractions[fromIndex - 1];
  inputs.value[destination.id].focus();
};

const focusLastItem = async () => {
  if (!workbench.currentInteractions) {
    return;
  }

  let destination =
    workbench.currentInteractions[workbench.currentInteractions.length - 1];
  inputs.value[destination.id].focus();
};
</script>
