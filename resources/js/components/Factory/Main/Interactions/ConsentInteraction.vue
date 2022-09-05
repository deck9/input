<template>
  <div
    class="group relative py-1 transition duration-200"
    :class="[index === 0 ? 'mt-4' : 'mt-8']"
  >
    <div class="flex items-center">
      <h3 class="font-medium">Consent Policy</h3>
      <IndexItem class="ml-2" type="button" v-bind="{ index }" />
    </div>
    <div class="mt-2 flex items-center">
      <section class="w-full space-y-2">
        <div class="relative">
          <D9Input
            :id="item.id + '_label'"
            name="label"
            ref="labelElement"
            type="text"
            v-model="label"
            block
            placeholder="Label"
          />
        </div>
        <div>
          <D9Textarea
            :id="item.id + '_message'"
            name="message"
            type="text"
            v-model="message"
            block
            placeholder="Message"
          />
        </div>
        <div class="flex items-center">
          <D9Switch
            onLabel="Yes"
            offLabel="No"
            label="Opt-In Required"
            :id="item.id + '_required'"
            v-model="isRequired"
          />
          <span class="ml-2 inline-block">Consent required</span>
        </div>
      </section>
    </div>

    <InteractionHoverActions @onDelete="workbench.deleteInteraction(item)" />
  </div>
</template>

<script setup lang="ts">
import { D9Input, D9Textarea, D9Switch } from "@deck9/ui";
import InteractionHoverActions from "@/components/Factory/Main/InteractionHoverActions.vue";
import IndexItem from "@/components/Factory/Shared/IndexItem.vue";
import { useWorkbench } from "@/stores";
import { Ref, ref, watch } from "vue";

const workbench = useWorkbench();

const props = defineProps<{
  index: number;
  item: FormBlockInteractionModel;
}>();

const labelElement = ref(null) as unknown as Ref<HTMLElement>;

const label: Ref<FormBlockInteractionModel["label"]> = ref(props.item.label);
const message: Ref<FormBlockInteractionModel["label"]> = ref(
  props.item.message
);
const options: Ref<FormBlockInteractionModel["options"]> = ref(
  props.item.options
);

const isRequired = ref<boolean>(options.value?.required ?? false);

watch([label, message, isRequired], (newValues) => {
  const update = {
    id: props.item.id,
    label: newValues[0],
    message: newValues[1],
    options: {
      required: newValues[2],
    },
  };

  workbench.updateInteraction(update);
});

const focus = () => {
  labelElement.value.focus();
};

defineExpose({
  item: props.item,
  focus,
});
</script>
