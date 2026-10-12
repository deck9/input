<template>
  <div
    class="min-w-0 flex-1 space-y-4 rounded-lg bg-white p-3 shadow-sm ring-1 ring-blue-500 sm:p-4"
  >
    <span :id="`${id}-text-label`" class="sr-only"
      >Question {{ number }} text</span
    >
    <Editor :id="`${id}-text`" ref="editor" v-model="message" counter />

    <ConfigureClicks v-if="interactionType === 'button'" />
    <ConfigureConsents v-else-if="interactionType === 'consent'" />

    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-grey-200 pt-3"
    >
      <div class="w-full sm:w-56">
        <label :for="`${id}-type`" class="sr-only">Answer type</label>
        <D9Select
          :id="`${id}-type`"
          v-model="type"
          :options="types"
          placeholder="Answer type"
        />
      </div>

      <div class="flex items-center gap-2">
        <label :for="`${id}-required`" class="text-sm text-grey-700">
          Required
        </label>
        <D9Switch
          :id="`${id}-required`"
          v-model="required"
          label="Required"
          onLabel="Yes"
          offLabel="No"
        />
      </div>

      <div class="ml-auto flex items-center gap-1">
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-md px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          :aria-expanded="settingsOpen"
          :aria-controls="`${id}-settings`"
          @click="settingsOpen = !settingsOpen"
        >
          Settings
          <D9Icon
            name="chevron-down"
            class="transition-transform"
            :class="settingsOpen && 'rotate-180'"
          />
        </button>
        <button
          type="button"
          class="flex h-9 items-center gap-1 rounded-md px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          @click="logic.showLogicEditor(block)"
        >
          Rules<span v-if="block.logics?.length" class="tabular-nums"
            >&nbsp;({{ block.logics.length }})</span
          >
        </button>
        <BlockMenu :block="block" :label="`Options for question ${number}`" />
      </div>
    </div>

    <QuestionSettings
      v-if="settingsOpen"
      :id="`${id}-settings`"
      :block="block"
      :interaction-type="interactionType"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, provide, ref, watch } from "vue";
import { D9Icon, D9Select, D9Switch } from "@deck9/ui";
import { useLogic, useWorkbench } from "@/stores";
import Editor from "@/components/Factory/Shared/Editor.vue";
import ConfigureClicks from "@/components/Factory/Main/ConfigureClicks.vue";
import ConfigureConsents from "@/components/Factory/Main/ConfigureConsents.vue";
import { useBlockTypes } from "@/components/Factory/utils/useBlockTypes";
import BlockMenu from "./BlockMenu.vue";
import QuestionSettings from "./QuestionSettings.vue";
import { cursorFor } from "./blockFocus";

const props = defineProps<{
  block: FormBlockModel;
  number: number;
}>();

// Configure* and IndexItem read the open block from here
provide("block", props.block);

const workbench = useWorkbench();
const logic = useLogic();
const { types } = useBlockTypes();

const id = computed(() => `question-${props.block.uuid}`);
const interactionType = computed(() => workbench.usesInteractionType);

const editor = ref<InstanceType<typeof Editor> | null>(null);
const message = ref(props.block.message ?? "");
const type = ref(types.value.find((item) => item.value === props.block.type));
const required = ref(props.block.is_required ?? false);
const settingsOpen = ref(false);

watch(message, (value) => workbench.updateBlock({ message: value }));
watch(required, (value) => workbench.updateBlock({ is_required: value }));
watch(type, (value) => {
  if (value?.value) {
    workbench.updateBlock({ type: value.value });
  }
});

const takeCursor = () => {
  if (cursorFor.value === props.block.uuid) {
    cursorFor.value = null;
    editor.value?.focus();
  }
};

onMounted(takeCursor);
watch(cursorFor, takeCursor);
</script>
