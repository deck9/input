<template>
  <div class="group relative py-1 transition duration-200">
    <div class="flex items-center">
      <section class="grid w-full grid-cols-2 gap-x-2">
        <div :class="{ 'col-span-2': multiple }">
          <div class="relative">
            <D9Input
              :id="item.id + '_label'"
              class="pl-12"
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
              <IndexItem class="" type="click" v-bind="{ index }" />
            </span>
          </div>
        </div>
        <div v-if="!multiple">
          <D9Input
            :id="item.id + '_reply'"
            name="reply"
            type="text"
            v-model="reply"
            block
            placeholder="Reply"
            @keyup.enter="keyboardCommands"
          />
        </div>
      </section>
    </div>

    <div
      class="absolute inset-y-2 -left-24 flex w-24 items-center justify-end space-x-2 pr-2 text-grey-400 opacity-0 transition duration-200 group-hover:opacity-100"
    >
      <button
        tabindex="-1"
        class="hover:text-grey-600"
        @click="workbench.deleteInteraction(item)"
      >
        <D9Icon name="trash" />
      </button>
      <button tabindex="-1" class="handle hover:text-grey-600">
        <D9Icon name="grip-vertical" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Input, D9Icon } from "@deck9/ui";
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";
import { useWorkbench } from "@/stores";
import { Ref, ref, watch, withDefaults } from "vue";

const workbench = useWorkbench();

const props = withDefaults(
  defineProps<{
    index: number;
    multiple?: boolean;
    item: FormBlockInteractionModel;
  }>(),
  {
    multiple: false,
  }
);

const emit = defineEmits<{
  (e: "next", index: number): void;
  (e: "nextSoft", index: number): void;
  (e: "previous", index: number): void;
  (e: "delete", index: number): void;
}>();

const labelElement = ref(null) as unknown as Ref<HTMLElement>;

const label: Ref<FormBlockInteractionModel["label"]> = ref(props.item.label);
const reply: Ref<FormBlockInteractionModel["label"]> = ref(props.item.reply);

watch([label, reply], (newValues) => {
  const update = {
    id: props.item.id,
    label: newValues[0],
    reply: newValues[1],
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
        await workbench.deleteInteraction(props.item);
        emit("delete", props.index);
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
