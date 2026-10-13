<template>
  <div
    ref="anchor"
    aria-hidden="true"
    class="pointer-events-none relative z-10 h-0"
  >
    <template v-for="line in lines" :key="line.target">
      <span
        data-rule-line
        class="absolute left-[3px] w-0.5 bg-blue-200"
        :style="{ top: `${line.top}px`, height: `${line.height}px` }"
      />
      <span
        class="absolute left-0 h-2 w-2 rounded-full bg-blue-500"
        :style="{ top: `${line.top - 4}px` }"
      />
      <span
        class="absolute left-[3px] h-0.5 w-4 bg-blue-200"
        :style="{ top: `${line.top + line.height - 1}px` }"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import { useForm, useWorkbench } from "@/stores";

const store = useForm();
const workbench = useWorkbench();
const anchor = ref<HTMLElement | null>(null);
const lines = ref<{ target: string; top: number; height: number }[]>([]);

// a row's number sits 24 px below the row's top
const NUMBER_MIDDLE = 24;

// where the open question's rules jump to
const targets = computed(() =>
  (workbench.block?.logics ?? [])
    .filter((rule) => rule.action === "goto" && rule.action_payload)
    .map((rule) => rule.action_payload as string),
);

const measure = () => {
  const origin = anchor.value?.getBoundingClientRect().top;
  const from = document
    .getElementById(`row-${workbench.block?.uuid}`)
    ?.getBoundingClientRect().top;

  lines.value = [];

  if (origin === undefined || from === undefined) {
    return;
  }

  const top = from - origin + NUMBER_MIDDLE;

  for (const target of new Set(targets.value)) {
    const to = document
      .getElementById(`row-${target}`)
      ?.getBoundingClientRect().top;
    const height = to === undefined ? 0 : to - origin + NUMBER_MIDDLE - top;

    if (height > 0) {
      lines.value.push({ target, top, height });
    }
  }
};

// the order of the rows: a move changes no height
const order = computed(() =>
  (store.blocks ?? [])
    .map((block) => `${block.uuid}:${block.parent_block}`)
    .join(),
);

watch([targets, order, () => workbench.block?.uuid], () => nextTick(measure), {
  immediate: true,
});

// rows grow and shrink while typing, opening and moving
useResizeObserver(() => anchor.value?.parentElement, measure);
</script>
