<template>
  <div>
    <div class="flex justify-between">
      <D9Label label="Allow Custom Response" />
      <D9Switch
        label=""
        v-model="useCustomResponse"
        onLabel="yes"
        offLabel="no"
        @change="updateCustomResponseSetting"
      />
    </div>
    <div v-show="useCustomResponse" class="mt-3">
      <D9Input
        v-model="customResponseLabel"
        block
        placeholder="Label for Custom Response Option"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useWorkbench } from "@/stores/workbench";
import { D9Label, D9Switch, D9Input } from "@deck9/ui";
import { computed, ref, watch } from "vue";
import useActiveInteractions from "../../Shared/useActiveInteractions";

const workbench = useWorkbench();
const { activeInteractions } = useActiveInteractions(workbench.block);

const INTERACTION_KEY = "alt_response";

const otherOptionInteraction = computed(() => {
  return activeInteractions.value?.find((interaction) => {
    return interaction.name === INTERACTION_KEY;
  });
});

const useCustomResponse = ref(
  otherOptionInteraction.value?.is_disabled === false,
);
const customResponseLabel = ref(otherOptionInteraction.value?.label ?? "");

watch([customResponseLabel], (newValues) => {
  if (!otherOptionInteraction.value) {
    return;
  }

  const update = {
    id: otherOptionInteraction.value.id,
    label: newValues[0],
  };

  workbench.updateInteraction(update);
});

const updateCustomResponseSetting = async () => {
  // check if we have already created the interaction used for other option
  if (!otherOptionInteraction.value) {
    // create the interaction
    await workbench.createInteraction("button", {
      name: INTERACTION_KEY,
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
</script>
