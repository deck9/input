<template>
  <div
    :id="id"
    role="group"
    :aria-labelledby="`${id}-title`"
    class="space-y-6"
    :class="!sheet && 'rounded-md border border-grey-200 bg-grey-50 p-3 sm:p-4'"
  >
    <h3
      :id="`${id}-title`"
      class="text-xs font-semibold text-grey-600"
      :class="sheet && 'sr-only'"
    >
      {{ heading }}
    </h3>

    <ConfigureInput v-if="interactionType === 'input'" />
    <ConfigureTextarea v-else-if="interactionType === 'textarea'" />
    <ConfigureRange v-else-if="interactionType === 'range'" />
    <ConfigureDate v-else-if="interactionType === 'date'" />
    <ConfigureFile v-else-if="interactionType === 'file'" />
    <template v-else-if="interactionType === 'button'">
      <RandomizeResponsesSetting />
      <CustomResponseSettings
        v-if="
          editableInteractions?.length &&
          ['radio', 'checkbox'].includes(block.type)
        "
      />
    </template>

    <div>
      <label
        :for="`${id}-identifier`"
        class="block text-sm font-medium text-grey-900"
        >Short name</label
      >
      <p :id="`${id}-identifier-help`" class="mb-1 text-xs text-grey-600">
        Used in prefill links, webhooks, emails and the submissions table.
      </p>
      <D9Input
        :id="`${id}-identifier`"
        v-model="title"
        :aria-describedby="`${id}-identifier-help`"
        block
      />
    </div>

    <div class="flex items-start justify-between gap-4">
      <div>
        <label :for="`${id}-hidden`" class="text-sm font-medium text-grey-900">
          Hide this question
        </label>
        <p class="text-xs text-grey-600">
          Hidden questions don't show in the form.
        </p>
      </div>
      <D9Switch
        :id="`${id}-hidden`"
        v-model="hidden"
        label="Hide this question"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { D9Input, D9Switch } from "@deck9/ui";
import { useWorkbench } from "@/stores";
import useActiveInteractions from "@/components/Factory/Shared/useActiveInteractions";
import ConfigureDate from "@/components/Factory/Main/ConfigureDate.vue";
import ConfigureFile from "@/components/Factory/Main/ConfigureFile.vue";
import ConfigureInput from "@/components/Factory/Main/ConfigureInput.vue";
import ConfigureRange from "@/components/Factory/Main/ConfigureRange.vue";
import ConfigureTextarea from "@/components/Factory/Main/ConfigureTextarea.vue";
import CustomResponseSettings from "@/components/Factory/Main/Interactions/CustomResponseSettings.vue";
import RandomizeResponsesSetting from "@/components/Factory/Main/Interactions/RandomizeResponsesSetting.vue";

const props = defineProps<{
  id: string;
  block: FormBlockModel;
  interactionType?: FormBlockInteractionType;
  // in the phone's bottom sheet, which has its own title
  sheet?: boolean;
}>();

const workbench = useWorkbench();
const { editableInteractions } = useActiveInteractions(props.block);

// named by answer type; "Text only" has no answer settings
const headings: Partial<Record<FormBlockInteractionType, string>> = {
  button: "Choices",
  input: "Answer field",
  textarea: "Answer field",
  date: "Date",
  file: "File upload",
  consent: "Consent",
};
const heading = computed(() => {
  if (props.interactionType === "range") {
    return props.block.type === "scale" ? "Scale" : "Rating";
  }

  return (
    (props.interactionType && headings[props.interactionType]) ?? "Settings"
  );
});

const title = ref(props.block.title ?? "");
const hidden = ref(props.block.is_disabled ?? false);

watch(title, (value) => workbench.updateBlock({ title: value }));
watch(hidden, (value) => workbench.updateBlock({ is_disabled: value }));
</script>
