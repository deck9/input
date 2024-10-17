<template>
  <div
    class="mt-4 space-y-4"
    v-if="showBlockLogic && block && block.logics && block.logics.length > 0"
  >
    <div v-for="rule in block.logics" :key="rule.id">
      <!-- Rule Conditions -->
      <div
        class="leading-none"
        v-for="(condition, index) in rule.conditions"
        :key="`${rule.id}-condition-${index}`"
      >
        <div
          class="-space-x-px grid grid-cols-5 relative text-xs leading-none -mb-px"
        >
          <div
            class="bg-blue-100 border border-blue-300 px-2 text-blue-800 text-center font-base py-1 z-10"
            :class="[index === 0 ? 'rounded-tl-md' : '']"
          >
            <span v-if="index !== 0">{{ condition.chainOperator }}</span>
            If
          </div>
          <div
            class="text-grey-700 font-base border border-blue-100 bg-white px-2 py-1 text-center"
          >
            {{ condition.source }}
          </div>
          <div
            class="border border-blue-100 bg-white px-2 py-1 text-center font-semibold"
          >
            {{ condition.operator }}
          </div>
          <div
            class="text-grey-700 font-base border border-blue-100 bg-white px-2 py-1 text-center col-span-2"
            :class="[index === 0 ? 'rounded-tr-md' : '']"
          >
            {{ condition.value }}
          </div>
        </div>
      </div>
      <div
        class="-space-x-px grid grid-cols-5 relative text-xs leading-none -mb-px"
      >
        <div
          class="bg-green-100 border border-green-400 px-3 text-green-800 text-center font-base py-1 z-10 rounded-bl-md"
        >
          then
        </div>
        <div
          class="text-grey-700 font-base border border-blue-100 bg-white px-3 py-1 text-center col-span-4 rounded-br-md"
        >
          <template v-if="rule.action === 'show'">
            <D9Icon name="eye" size="sm" />
            show this block
          </template>
          <template v-else>
            <D9Icon name="eye-slash" size="sm" />
            hide this block
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
import { inject, ref } from "vue";

const block: FormBlockModel | null = inject("block") ?? null;

const showBlockLogic = ref(true);
</script>
