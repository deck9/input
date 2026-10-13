<template>
  <Container
    :data-group="groupId"
    group-name="document"
    lock-axis="y"
    orientation="vertical"
    drag-handle-selector=".document-grip"
    :get-child-payload="getChildPayload"
    :should-accept-drop="shouldAcceptDrop"
    :drop-placeholder="{
      animationDuration: 150,
      showOnTop: false,
      className: 'cards-drop-preview',
    }"
    @drop="onDrop"
  >
    <Draggable v-for="block in blocks" :key="block.uuid">
      <div class="pb-2">
        <DocumentGroup
          v-if="block.type === 'group'"
          :group="block"
          :numbers="numbers"
        />
        <DocumentQuestion v-else :block="block" :number="numbers[block.uuid]" />
        <BlockRules
          v-if="block.type !== 'group'"
          :block="block"
          :numbers="numbers"
          class="pl-12"
        />
      </div>
    </Draggable>
  </Container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import { useForm } from "@/stores";
import DocumentGroup from "./DocumentGroup.vue";
import DocumentQuestion from "./DocumentQuestion.vue";
import BlockRules from "./Rules/BlockRules.vue";

const props = defineProps<{
  groupId?: string;
  numbers: Record<string, number>;
}>();

const store = useForm();

const blocks = computed(() =>
  (store.blocks ?? []).filter(
    (block) => (block.parent_block ?? undefined) === props.groupId,
  ),
);

const getChildPayload = (index: number) => blocks.value[index];

const shouldAcceptDrop = (source: any, payload?: FormBlockModel) => {
  if (source.groupName !== "document") return false;

  // a group can't go inside a group
  return !(props.groupId && payload?.type === "group");
};

const onDrop = ({ addedIndex, payload }: any): void => {
  if (addedIndex !== null) {
    store.changeBlockSequence(props.groupId ?? false, addedIndex, payload);
  }
};
</script>
