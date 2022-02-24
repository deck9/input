<template>
  <Container lock-axis="y" orientation="vertical" @drop="onDrop">
    <Draggable v-for="block in store.blocks" :key="block.uuid">
      <Block :block="block" :key="`${block.sequence}-${block.uuid}`" />
    </Draggable>
    <FinalBlock />
  </Container>
</template>

<script setup lang="ts">
import Block from "./Block.vue";
import FinalBlock from "./FinalBlock.vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import { useForm } from "@/stores";

const store = useForm();

const onDrop = ({ removedIndex, addedIndex }: any): void => {
  if (removedIndex === null || addedIndex === null) {
    return;
  }

  store.changeBlockSequence(removedIndex, addedIndex);
};
</script>
