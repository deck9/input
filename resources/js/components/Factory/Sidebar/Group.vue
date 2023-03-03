<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />
    <button
      class="relative block w-full rounded-md border-dashed px-4 py-3 text-left"
      :class="cardStyle"
      @click.stop="workbench.putOnWorkbench(block)"
    >
      <h1
        class="mr-4 -ml-2 rounded px-2 py-1 font-bold text-grey-400 hover:bg-grey-100"
        :class="[{ 'mb-3': !isCollapsed }]"
      >
        <button
          class="mr-1 cursor-pointer hover:text-blue-400"
          @click.prevent="toggleGroup"
        >
          <D9Icon
            class="transition-transform duration-150"
            :class="[{ '-rotate-90': isCollapsed }]"
            name="chevron-down"
          />
        </button>
        {{ block.title ?? "Group" }}
        <span class="font-light italic" v-show="isCollapsed"
          >({{ t("admin.blocks", groupCount) }})</span
        >
      </h1>
      <div
        v-if="showBlockMenus"
        class="absolute right-3 top-2 hover:opacity-100"
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
            label="Delete"
            @click.stop="deleteBlock"
          />
        </D9Menu>
      </div>
      <BlockContainer
        v-show="!isCollapsed"
        :groupId="block.uuid"
        class="transition duration-200"
      />
    </button>
  </div>
</template>

<script lang="ts" setup>
import BlockContainer from "@/components/Factory/Sidebar/BlockContainer.vue";
import InsertAfterButton from "./InsertAfterButton.vue";
import copy from "copy-text-to-clipboard";
import { D9Menu, D9MenuLink, D9Icon } from "@deck9/ui";
import { useActiveCard } from "@/utils/useActiveCard";
import { useWorkbench, useForm } from "@/stores";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";

const props = defineProps<{
  block: FormBlockModel;
}>();

const { t } = useI18n();

const workbench = useWorkbench();
const store = useForm();

const { showBlockMenus } = storeToRefs(store);

const isCollapsed = ref(false);

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id
    ? true
    : false;
});
const { cardStyle } = useActiveCard(isActive);

const groupCount = computed(() => {
  return store.countGroups[props.block.uuid];
});

const deleteBlock = () => {
  let result = window.confirm(
    "Do you really want to delete this group? All blocks inside this group will be deleted as well."
  );

  if (result) {
    store.deleteFormBlock(props.block);

    if (workbench.block?.id === props.block.id) {
      workbench.clearWorkbench();
    }
  }
};

const copyId = () => {
  copy(props.block.uuid);
};

const toggleGroup = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
