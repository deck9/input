<template>
  <div>
    <h2 class="mb-2 text-base font-bold">Configure Choices</h2>

    <div class="bg-white px-4 py-6 rounded">
      <div
        v-if="activeInteractions?.length === 0"
        class="
          bg-grey-200
          block
          font-heading
          mb-4
          px-4
          py-3
          rounded
          text-grey-700
        "
      >
        Nothing here yet.
        <small class="font-sans text-sm block"
          >Add your first option by clicking on the button below.</small
        >
      </div>

      <ClickInteraction
        v-for="(item, index) in activeInteractions"
        :key="item.id"
        v-bind="{ item, index, multiple: workbench.isMultipleChoice }"
      />

      <div class="mt-4">
        <D9Button
          label="Add new option"
          icon="plus"
          icon-position="left"
          type="dark"
          @click="createClickInteraction"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkbench } from "@/stores";
import { D9Button } from "@deck9/ui";
import { ref } from "vue";
import ClickInteraction from "./Interactions/ClickInteraction.vue";
import useActiveInteractions from "../Shared/useActiveInteractions";

const workbench = useWorkbench();

const { activeInteractions } = useActiveInteractions(workbench.block);
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
