<template>
  <div class="group relative px-4 py-2 transition duration-200">
    <div class="flex items-center">
      <IndexItem class="mr-3 mt-5" type="click" v-bind="{ index }" />

      <section class="grid w-full grid-cols-2 gap-x-2 pr-2">
        <div :class="{ 'col-span-2': multiple }">
          <D9Label
            class="leading-0 block cursor-pointer text-xs font-bold text-grey-700"
            :id="`${item.id}_label`"
            label="Label"
          />
          <D9Input
            :id="item.id + '_label'"
            name="label"
            type="text"
            v-model="label"
            block
            placeholder="Label"
          />
        </div>
        <div v-if="!multiple">
          <D9Label
            class="leading-0 block cursor-pointer text-xs font-bold text-grey-700"
            :id="item.id + '_reply'"
            label="Reply"
          />
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
      class="absolute inset-y-0 right-0 flex items-center pt-5 opacity-0 transition duration-200 group-hover:opacity-100"
    >
      <button
        class="flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white"
        @click="workbench.deleteInteraction(item)"
      >
        <D9Icon size="xs" name="times" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { D9Label, D9Input, D9Icon } from "@deck9/ui";
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
