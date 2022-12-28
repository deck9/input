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

    <div class="mb-3 flex justify-between pt-3">
      <D9Label label="Allow Custom Response" />
      <D9Switch
        label=""
        v-model="useCustomResponse"
        onLabel="yes"
        offLabel="no"
        @change="updateCustomResponseSetting"
      />
    </div>

    <div class="mt-4">
      <D9Button
        label="Add new option"
        icon="plus"
        icon-position="left"
        color="dark"
        :isLoading="isCreatingInteraction"
        @click="createClickInteraction"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button, D9Label, D9Switch } from "@deck9/ui";
import { ref, nextTick, computed } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import EmptyState from "@/components/EmptyState.vue";
import { useKeyboardNavigation } from "@/components/Factory/utils/useKeyboardNavigation";
import useActiveInteractions from "../Shared/useActiveInteractions";

const workbench = useWorkbench();
const { activeInteractions, editableInteractions } = useActiveInteractions(
  workbench.block
);

const otherOptionInteractionName = "other_response";

const otherOptionInteraction = computed(() => {
  return activeInteractions.value?.find((interaction) => {
    return interaction.name === otherOptionInteractionName;
  });
});

const useCustomResponse = ref(
  otherOptionInteraction.value?.is_disabled === false
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

const updateCustomResponseSetting = async () => {
  // check if we have already created the interaction used for other option
  if (!otherOptionInteraction.value) {
    // create the interaction
    await workbench.createInteraction("button", {
      name: otherOptionInteractionName,
      is_editable: false,
      is_disabled: !useCustomResponse.value,
    });
  } else {
    // update the interaction
    await workbench.updateInteraction({
      id: otherOptionInteraction.value.id,
      is_disabled: !useCustomResponse.value,
    });
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
