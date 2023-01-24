<template>
  <Container
    :data-group="groupId"
    group-name="storyboard"
    lock-axis="y"
    orientation="vertical"
    :get-child-payload="getChildPayload"
    :get-ghost-parent="getGhostParent"
    :should-accept-drop="shouldAcceptDrop"
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
import { computed, nextTick } from "vue";
import { useForm } from "@/stores";

const props = defineProps<{
  groupId?: string;
}>();

const store = useForm();

const transitionClasses = computed((): Record<string, string> => {
  if (store.enableCssTransition) {
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
    return store.blocks?.filter((block) => {
      return block.parent_block && block.parent_block === props.groupId;
    });
  }

  return store.blocks?.filter((block) => {
    return !block.parent_block;
  });
});

const getChildPayload = (index: number) => {
  if (!groupBlocks.value) {
    return false;
  }

  return groupBlocks.value[index];
};

const getGhostParent = () => {
  return document.getElementById("smooth-dnd-container");
};

const shouldAcceptDrop = (sourceContainerOptions: any, payload: any) => {
  if (props.groupId) {
    // do not allow groups to be dropped into groups
    return payload.type !== "group";
  }

  return true;
};

const onDrop = (dropResult: any): void => {
  const { addedIndex, payload } = dropResult;

  if (addedIndex !== null) {
    store.setCssTransition(false);

    store.changeBlockSequence(props.groupId ?? false, addedIndex, payload);

    nextTick(() => {
      store.setCssTransition(true);
    });
  }
};
</script>
