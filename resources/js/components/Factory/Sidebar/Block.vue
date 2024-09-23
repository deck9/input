<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />

    <button
      class="group relative block w-full cursor-pointer overflow-visible rounded-md p-4 text-left"
      :class="[cardStyle, { 'opacity-50': block.is_disabled }]"
      @click.stop="workbench.putOnWorkbench(block)"
    >
      <div
        v-if="showBlockMenus"
        class="absolute right-3 top-3 hover:opacity-100"
        :class="isActive ? 'opacity-100' : 'opacity-25'"
      >
        <D9Menu
          class="text-grey-400"
          position="right"
          :use-portal="true"
          :key="`${block.sequence}-position-menu`"
        >
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            :meta="block.uuid"
            label="Copy ID"
            @click="copyId"
          />
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            :label="block.is_disabled ? 'Enable Block' : 'Disable Block'"
            @click="disableBlock"
          />
          <D9MenuLink
            as="button"
            class="block w-full text-left"
            label="Delete"
            @click.stop="deleteBlock"
          />
        </D9Menu>
      </div>

      <div class="relative mt-3 flex items-start">
        <div class="pr-4">
          <ConsentBlockMessage v-if="block.type === 'consent'" />

          <DefaultBlockMessage v-if="block.message" :content="block.message" />
          <div v-else class="mb-2 font-light text-grey-400">--empty--</div>
        </div>
      </div>

      <BlockInteraction
        v-for="(interaction, index) in editableInteractions"
        v-bind="{ interaction, index }"
        :key="interaction.id"
      />

      <!-- Block Status -->
      <div class="flex space-x-1 mt-4">
        <button
          class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
          :class="[
            block.has_logic
              ? 'bg-blue-100 outline-blue-200'
              : 'bg-grey-100 outline-grey-200',
          ]"
          @click="showLogicEditor"
        >
          <D9Icon name="code-branch" size="sm" />
          <span>Block Logic</span>
        </button>
        <button
          class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
          :class="[
            block.is_required
              ? 'bg-red-100 outline-red-200'
              : 'bg-grey-100 outline-grey-200',
          ]"
          @click="toggleRequired()"
        >
          <template v-if="block.is_required">
            <D9Icon name="asterisk" size="sm" />
            <span>Required</span>
          </template>
          <template v-else>
            <D9Icon name="question" size="sm" />
            <span>Optional</span>
          </template>
        </button>
        <button
          class="flex items-center space-x-1 rounded-lg px-2 py-1 leading-none text-xs hover:text-black hover:outline text-grey-700"
          :class="[
            block.is_disabled
              ? 'bg-grey-100 outline-grey-200'
              : 'bg-green-50 outline-green-100',
          ]"
          @click="disableBlock()"
        >
          <template v-if="block.is_disabled">
            <D9Icon name="circle-dot" size="sm" />
            <span>Disabled</span>
          </template>
          <template v-else>
            <D9Icon name="circle-check" size="sm" />
            <span>Enabled</span>
          </template>
        </button>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from "vue";
import ConsentBlockMessage from "./ConsentBlockMessage.vue";
import DefaultBlockMessage from "./DefaultBlockMessage.vue";
import BlockInteraction from "./BlockInteraction.vue";
import { useWorkbench, useForm, useLogic } from "@/stores";
import { D9Menu, D9MenuLink, D9Icon } from "@deck9/ui";
import copy from "copy-text-to-clipboard";
import useActiveInteractions from "../Shared/useActiveInteractions";
import { useActiveCard } from "@/utils/useActiveCard";
import InsertAfterButton from "./InsertAfterButton.vue";
import { storeToRefs } from "pinia";

const workbench = useWorkbench();
const store = useForm();
const logicStore = useLogic();

const { showBlockMenus } = storeToRefs(store);

const props = defineProps<{
  block: FormBlockModel;
}>();

provide("block", props.block);

const { editableInteractions } = useActiveInteractions(props.block);

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});

const { cardStyle } = useActiveCard(isActive);

const deleteBlock = () => {
  const result = window.confirm("Do you really want to delete this block?");

  if (result) {
    store.deleteFormBlock(props.block);

    if (workbench.block?.id === props.block.id) {
      workbench.clearWorkbench();
    }
  }
};

const disableBlock = () => {
  store.updateFormBlockProperty(
    props.block,
    "is_disabled",
    !props.block.is_disabled,
  );
};

const toggleRequired = () => {
  store.updateFormBlockProperty(
    props.block,
    "is_required",
    !props.block.is_required,
  );
};

const showLogicEditor = () => {
  logicStore.showLogicEditor(props.block);
};

const copyId = () => {
  copy(props.block.uuid);
};
</script>
