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
    <Draggable v-for="(block, index) in blocks" :key="block.uuid">
      <div class="relative pb-2">
        <DocumentGroup
          v-if="block.type === 'group'"
          :group="block"
          :numbers="numbers"
        />
        <DocumentQuestion v-else :block="block" :number="numbers[block.uuid]" />
        <AddQuestionLine
          v-if="index < blocks.length - 1"
          :after="block"
          :label="blockName(block, numbers)"
        />
      </div>
      <TypePicker
        v-if="addAt?.key === `after-${block.uuid}`"
        class="mb-2 ml-8 sm:ml-12"
        :title="`Add a question after ${blockName(block, numbers)}`"
        @pick="addQuestion"
        @close="closePicker"
      />
    </Draggable>
  </Container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Container, Draggable } from "vue3-smooth-dnd";
import { useForm } from "@/stores";
import DocumentGroup from "./DocumentGroup.vue";
import DocumentQuestion from "./DocumentQuestion.vue";
import AddQuestionLine from "./AddQuestionLine.vue";
import TypePicker from "./TypePicker.vue";
import { addAt, blockName, closePicker, useAddQuestion } from "./addQuestion";

const props = defineProps<{
  groupId?: string;
  numbers: Record<string, number>;
}>();

const store = useForm();
const { addQuestion } = useAddQuestion();

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
