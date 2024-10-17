<template>
  <div class="relative pb-6 text-sm">
    <InsertAfterButton v-bind="{ block }" />
    <button
      class="relative block w-full rounded-md border-dashed px-4 py-3 text-left"
      :class="[cardStyle, { 'opacity-50': block.is_disabled }]"
      @click.stop="workbench.putOnWorkbench(block)"
    >
      <button
        class="-ml-2 rounded pl-2 pr-5 py-1 font-bold text-grey-400 hover:bg-grey-100 block text-left"
        :class="[{ 'mb-3': !isCollapsed }]"
        @click.prevent="toggleGroup"
      >
        <D9Icon
          class="transition-transform duration-150 mr-2"
          :class="[{ '-rotate-90': isCollapsed }]"
          name="chevron-down"
        />
        <D9Icon name="layer-group" size="sm" />
        {{ block.title ?? "Group" }}
        <span class="font-light italic" v-show="isCollapsed"
          >({{ t("admin.blocks", groupCount) }})</span
        >
      </button>
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
      <BlockContainer
        v-show="!isCollapsed"
        :groupId="block.uuid"
        class="transition duration-200"
      />

      <div class="flex space-x-1">
        <div class="mt-2" v-if="block.is_disabled">
          <Label color="grey">disabled</Label>
        </div>
      </div>
    </button>
  </div>
</template>

<script lang="ts" setup>
import BlockContainer from "@/components/Factory/Sidebar/BlockContainer.vue";
import InsertAfterButton from "./InsertAfterButton.vue";
import Label from "@/components/Label.vue";
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

const isCollapsed = ref(props.block.is_disabled ?? false);

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
    "Do you really want to delete this group? All blocks inside this group will be deleted as well.",
  );

  if (result) {
    store.deleteFormBlock(props.block);

    if (workbench.block?.id === props.block.id) {
      workbench.clearWorkbench();
    }
  }
};

const disableBlock = () => {
  if (!props.block.is_disabled) {
    isCollapsed.value = true;
  }

  store.updateFormBlockProperty(
    props.block,
    "is_disabled",
    !props.block.is_disabled,
  );
};

const copyId = () => {
  copy(props.block.uuid);
};

const toggleGroup = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>
