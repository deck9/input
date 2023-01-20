<template>
  <Container
    group-name="storyboard"
    lock-axis="y"
    orientation="vertical"
    :get-child-payload="getChildPayload"
    :drop-placeholder="{
      animationDuration: 150,
      showOnTop: false,
      className: 'cards-drop-preview',
    }"
    @drop="onDrop"
  >
    <TransitionGroup v-bind="transitionClasses">
      <Draggable v-for="block in groupBlocks" :key="block.uuid">
        <component
          :is="block.type === 'group' ? Group : Block"
          :block="block"
          :key="`${block.sequence}-${block.uuid}`"
        />
      </Draggable>
    </TransitionGroup>
  </Container>
</template>

<script setup lang="ts">
import Block from "./Block.vue";
import Group from "./Group.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import { ref, computed, nextTick } from "vue";
import { useForm } from "@/stores";

const props = defineProps<{
  groupId?: string;
}>();

const store = useForm();
const enableCssTransition = ref(true);

const transitionClasses = computed((): Record<string, string> => {
  if (enableCssTransition.value) {
    return {
      moveClass: "transition duration-200",
      leaveToClass: "opacity-0 -translate-y-2",
      leaveActiveClass: "absolute inset-x-0 transition duration-150 ease-out",
    };
  }

  return {};
});

const groupBlocks = computed(() => {
  if (props.groupId) {
    return [];
  }

  return store.blocks;
});

const getChildPayload = (index: number) => {
  if (!groupBlocks.value) {
    return false;
  }

  return groupBlocks.value[index];
};

const onDrop = (dropResult: any): void => {
  const { removedIndex, addedIndex } = dropResult;

  console.log("onDrop", props.groupId ?? "root", dropResult);

  enableCssTransition.value = false;
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  store.changeBlockSequence(removedIndex, addedIndex);
  nextTick(() => {
    enableCssTransition.value = true;
  });
};
</script>
