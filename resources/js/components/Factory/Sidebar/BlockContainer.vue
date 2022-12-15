<template>
  <Container lock-axis="y" orientation="vertical" @drop="onDrop">
    <TransitionGroup v-bind="transitionClasses">
      <Draggable v-for="block in store.blocks" :key="block.uuid">
        <Block :block="block" :key="`${block.sequence}-${block.uuid}`" />
      </Draggable>
      <FinalBlock key="final-block" />
    </TransitionGroup>
  </Container>
</template>

<script setup lang="ts">
import Block from "./Block.vue";
import FinalBlock from "./FinalBlock.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import { ref, computed, nextTick } from "vue";
import { useForm } from "@/stores";

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

const onDrop = ({ removedIndex, addedIndex }: any): void => {
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
