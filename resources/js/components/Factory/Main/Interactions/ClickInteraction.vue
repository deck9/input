<template>
  <div class="py-1">
    <div
      class="flex min-h-9 items-center gap-2 rounded-md border border-grey-300 bg-white pl-2 pr-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
    >
      <IndexItem type="button" v-bind="{ index, showColors: false }" />
      <section class="flex min-w-0 flex-1 gap-x-2 [&>*]:min-w-0">
        <D9Input
          :id="item.id + '_label'"
          :class="field"
          :aria-label="`Choice ${index + 1}`"
          name="label"
          ref="labelElement"
          type="text"
          v-model="label"
          block
          placeholder="Label"
          @keyup.enter="keyboardCommands"
          @keyup.up.exact="keyboardCommands"
          @keyup.down.exact="keyboardCommands"
          @keydown.alt.up.exact.prevent.stop="emit('move', index, -1)"
          @keydown.alt.down.exact.prevent.stop="emit('move', index, 1)"
          @keydown.meta.delete.prevent="keyboardCommands"
        />
        <D9Input
          v-if="showReply"
          :id="item.id + '_message'"
          :class="[field, '!border-l !border-grey-200']"
          :aria-label="`Reply for choice ${index + 1}`"
          name="message"
          type="text"
          v-model="message"
          block
          placeholder="Reply"
          @keyup.enter="keyboardCommands"
        />
      </section>
      <ChoiceRowActions
        :label="label ? `choice “${label}”` : `choice ${index + 1}`"
        @onDelete="emit('onDelete', index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Input } from "@deck9/ui";
import ChoiceRowActions from "@/components/Factory/Main/ChoiceRowActions.vue";
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";
import { useWorkbench } from "@/stores";
import { Ref, ref, watch } from "vue";
import type { Step } from "@/components/Factory/Document/blockMove";

const workbench = useWorkbench();

const props = withDefaults(
  defineProps<{
    index: number;
    showReply?: boolean;
    item: FormBlockInteractionModel;
  }>(),
  {
    showReply: false,
  },
);

const emit = defineEmits<{
  (e: "next", index: number): void;
  (e: "nextSoft", index: number): void;
  (e: "previous", index: number): void;
  (e: "onDelete", index: number): void;
  (e: "move", index: number, step: Step): void;
}>();

// the row draws the border, so its fields are bare
const field = "!border-0 !bg-transparent !px-1 !py-2 focus:!ring-0";

const labelElement = ref<InstanceType<typeof D9Input> | null>(null);

const label: Ref<FormBlockInteractionModel["label"]> = ref(props.item.label);
const message: Ref<FormBlockInteractionModel["label"]> = ref(
  props.item.message,
);

watch([label, message], (newValues) => {
  const update = {
    id: props.item.id,
    label: newValues[0],
    message: newValues[1],
  };

  workbench.updateInteraction(update);
});

const keyboardCommands = async (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
      // check for modifier
      if (event.shiftKey) {
        return emit("previous", props.index);
      }

      return emit("next", props.index);

    case "Backspace":
      if (event.metaKey) {
        emit("onDelete", props.index);
      }
      break;

    case "ArrowUp":
      return emit("previous", props.index);

    case "ArrowDown":
      return emit("nextSoft", props.index);
  }
};

const focus = () => {
  labelElement.value?.focus();
};

defineExpose({
  item: props.item,
  focus,
});
</script>
