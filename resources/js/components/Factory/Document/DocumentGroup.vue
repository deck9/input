<template>
  <section
    :id="`row-${group.uuid}`"
    :aria-labelledby="`${id}-label`"
    class="scroll-mt-4 rounded-lg border border-grey-200 bg-grey-50 py-2 pr-2"
    :class="isOpen && 'ring-1 ring-blue-500'"
  >
    <div
      class="group/header flex flex-wrap items-center gap-x-2 gap-y-1 pb-2 pl-1"
    >
      <span
        aria-hidden="true"
        title="Drag to reorder"
        class="document-grip grid h-6 w-6 cursor-grab place-items-center rounded text-grey-500 hover:bg-grey-100 hover:text-grey-900 lg:opacity-0 lg:group-focus-within/header:opacity-100 lg:group-hover/header:opacity-100"
      >
        <D9Icon name="grip-vertical" />
      </span>
      <D9Icon name="layer-group" aria-hidden="true" class="text-grey-600" />
      <label :id="`${id}-label`" :for="`${id}-name`" class="sr-only"
        >Group name</label
      >
      <input
        :id="`${id}-name`"
        v-model="name"
        type="text"
        placeholder="Group"
        title="Use a group to show or hide several questions with one rule."
        class="h-9 min-w-0 flex-1 rounded-md border-0 bg-transparent px-2 text-sm font-semibold text-grey-700 placeholder:text-grey-600 hover:bg-grey-100 focus:bg-white focus:ring-2 focus:ring-blue-500"
      />
      <span v-if="group.is_disabled" class="text-xs text-grey-600">Hidden</span>
      <button
        type="button"
        class="flex h-9 items-center rounded-md px-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        @click="logic.showLogicEditor(group)"
      >
        Rules<span v-if="group.logics?.length" class="tabular-nums"
          >&nbsp;({{ group.logics.length }})</span
        >
      </button>
      <BlockMenu
        :block="group"
        :label="`Options for group ${group.title || 'Group'}`"
        @add-to-group="addQuestion"
      />
    </div>

    <div class="relative">
      <DocumentList
        :group-id="group.uuid"
        :numbers="numbers"
        :class="isEmpty && 'min-h-16'"
      />
      <div
        v-if="isEmpty"
        class="pointer-events-none absolute inset-0 ml-12 grid place-items-center rounded-md border-2 border-dashed border-grey-300 px-3 text-center text-sm text-grey-600"
      >
        <p>
          Drag questions here, or
          <button
            type="button"
            class="pointer-events-auto rounded font-semibold text-blue-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            @click="addQuestion"
          >
            add a question</button
          >.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { D9Icon } from "@deck9/ui";
import { useForm, useLogic, useWorkbench } from "@/stores";
import BlockMenu from "./BlockMenu.vue";
import DocumentList from "./DocumentList.vue";
import { useAddBlock } from "./blockFocus";

const props = defineProps<{
  group: FormBlockModel;
  numbers: Record<string, number>;
}>();

const store = useForm();
const workbench = useWorkbench();
const logic = useLogic();
const { addBlock } = useAddBlock();

const id = computed(() => `group-${props.group.uuid}`);
const isOpen = computed(() => workbench.block?.id === props.group.id);
const children = computed(() =>
  (store.blocks ?? []).filter(
    (block) => block.parent_block === props.group.uuid,
  ),
);
const isEmpty = computed(() => children.value.length === 0);

const name = ref(props.group.title ?? "");

// the name saves like any open block, so typing opens the group
watch(name, (value) => {
  if (!isOpen.value) {
    workbench.putOnWorkbench(props.group);
  }

  workbench.updateBlock({ title: value });
});

const addQuestion = () => {
  const last = children.value.at(-1);

  if (last) {
    addBlock(last);
  } else {
    addBlock(null, null, props.group.uuid);
  }
};
</script>
