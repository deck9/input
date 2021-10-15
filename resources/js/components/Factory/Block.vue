<template>
  <button
    class="relative block w-full text-left cursor-pointer px-6 py-8 group"
    @click="workbench.putOnWorkbench(block)"
  >
    <div class="treeline w-1 bg-grey-200 absolute top-12 left-[42px] -bottom-8"></div>

    <div class="flex items-start relative">
      <div
        class="mt-px mr-4 flex-shrink-0 py-1 w-10 text-center font-black text-xs rounded-sm transition duration-150"
        :class="isActive ? 'bg-blue-300' : 'bg-grey-200 group-hover:bg-yellow-300'"
      >{{ romanSequence }}</div>

      <div class="flex w-full pr-4 font-medium">
        <ConsentBlockMessage v-if="block.type === 'consent'" />
        <div class="mb-2" v-else-if="block.message" v-html="block.message"></div>
        <div v-else class="mb-2 text-grey-400 font-light">--Empty--</div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { romanize } from "@/utils"
import ConsentBlockMessage from "./ConsentBlockMessage.vue"
import { useWorkbench } from "@/stores"

const workbench = useWorkbench()

const props = defineProps<{
  block: FormBlockModel
}>()

const editBlock = (): void => {
  console.info('please edit block', props.block.uuid)
}

const romanSequence = computed(() => {
  return romanize(props.block.sequence + 1)
})

const isActive = computed((): boolean => {
  return workbench.block && workbench.block.id === props.block.id ? true : false
})
</script>
