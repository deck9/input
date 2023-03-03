<template>
  <div class="group relative py-1 transition duration-200">
    <div class="flex items-center">
      <section class="grid w-full grid-cols-2 gap-x-2">
        <div :class="{ 'col-span-2': !showReply }">
          <div class="relative">
            <D9Input
              :id="item.id + '_label'"
              class="!pl-12"
              name="label"
              ref="labelElement"
              type="text"
              v-model="label"
              block
              placeholder="Label"
              @keyup.enter="keyboardCommands"
              @keyup.up="keyboardCommands"
              @keyup.down="keyboardCommands"
              @keydown.meta.delete.prevent="keyboardCommands"
            />
            <span class="absolute inset-y-0 flex items-center px-3">
              <IndexItem type="button" v-bind="{ index }" />
            </span>
          </div>
        </div>
        <div v-if="showReply">
          <D9Input
            :id="item.id + '_message'"
            name="message"
            type="text"
            v-model="message"
            block
            placeholder="Reply"
            @keyup.enter="keyboardCommands"
          />
        </div>
      </section>
    </div>

    <InteractionHoverActions @onDelete="workbench.deleteInteraction(item)" />
  </div>
</template>

<script setup lang="ts">
import { D9Input } from "@deck9/ui";
import InteractionHoverActions from "@/components/Factory/Main/InteractionHoverActions.vue";
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";
import { useWorkbench } from "@/stores";
import { Ref, ref, watch, withDefaults } from "vue";

const workbench = useWorkbench();

const props = withDefaults(
  defineProps<{
    index: number;
    showReply?: boolean;
    item: FormBlockInteractionModel;
  }>(),
  {
    showReply: false,
  }
);

const emit = defineEmits<{
  (e: "next", index: number): void;
  (e: "nextSoft", index: number): void;
  (e: "previous", index: number): void;
  (e: "onDelete", index: number): void;
}>();

const labelElement = ref(null) as unknown as Ref<HTMLElement>;

const label: Ref<FormBlockInteractionModel["label"]> = ref(props.item.label);
const message: Ref<FormBlockInteractionModel["label"]> = ref(
  props.item.message
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
        await workbench.deleteInteraction(props.item);
      }
      break;

    case "ArrowUp":
      return emit("previous", props.index);

    case "ArrowDown":
      return emit("nextSoft", props.index);
  }
};

const focus = () => {
  labelElement.value.focus();
};

defineExpose({
  item: props.item,
  focus,
});
</script>
