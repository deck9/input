<template>
  <div class="group relative py-1 transition duration-200">
    <div class="flex items-center">
      <section class="grid w-full grid-cols-2 gap-x-2">
        <div :class="{ 'col-span-2': multiple }">
          <div class="relative">
            <D9Input
              :id="item.id + '_label'"
              class="pl-12"
              name="label"
              type="text"
              v-model="label"
              block
              placeholder="Label"
            />
            <span class="absolute inset-y-0 flex items-center px-3">
              <IndexItem class="" type="click" v-bind="{ index }" />
            </span>
          </div>
        </div>
        <div v-if="!multiple">
          <D9Input
            :id="item.id + '_reply'"
            name="reply"
            type="text"
            v-model="reply"
            block
            placeholder="Reply"
          />
        </div>
      </section>
    </div>

    <div
      class="text-grey-400 absolute inset-y-2 -left-24 flex w-24 items-center justify-end space-x-2 pr-2 opacity-0 transition duration-200 group-hover:opacity-100"
    >
      <button
        class="hover:text-grey-600"
        @click="workbench.deleteInteraction(item)"
      >
        <D9Icon name="trash" />
      </button>
      <button class="handle hover:text-grey-600">
        <D9Icon name="grip-vertical" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Input, D9Icon } from "@deck9/ui";
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";
import { useWorkbench } from "@/stores";
import { Ref, ref, watch, withDefaults } from "vue";

const workbench = useWorkbench();

const props = withDefaults(
  defineProps<{
    index?: number;
    multiple?: boolean;
    item: FormBlockInteractionModel;
  }>(),
  {
    multiple: false,
  }
);

const label: Ref<FormBlockInteractionModel["label"]> = ref(props.item.label);
const reply: Ref<FormBlockInteractionModel["label"]> = ref(props.item.reply);

watch([label, reply], (newValues) => {
  const update = {
    id: props.item.id,
    label: newValues[0],
    reply: newValues[1],
  };

  workbench.updateInteraction(update);
});
</script>
