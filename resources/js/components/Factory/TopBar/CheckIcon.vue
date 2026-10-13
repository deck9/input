<template>
  <span
    aria-hidden="true"
    class="grid h-5 w-5 flex-none place-items-center rounded-full"
    :class="tones[tone].class"
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path :d="tones[tone].d" />
    </svg>
  </span>
</template>

<script setup lang="ts">
defineProps<{ tone: "ok" | "warning" | "note" }>();

const tones = {
  ok: { class: "bg-green-100 text-green-800", d: "M20 6 9 17l-5-5" },
  warning: { class: "bg-yellow-100 text-yellow-800", d: "M12 7v6M12 17h.01" },
  note: { class: "bg-blue-100 text-blue-700", d: "M12 16v-5M12 8h.01" },
};
</script>
