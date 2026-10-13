<template>
  <!-- From lg the pages sit in the top bar, under it in a bottom bar -->
  <nav
    v-if="placement === 'top'"
    aria-label="Form pages"
    class="hidden h-14 flex-none items-stretch gap-0.5 lg:flex"
  >
    <Link
      v-for="page in pages"
      :key="page.label"
      :href="page.href"
      :aria-current="page.current ? 'page' : undefined"
      class="relative flex items-center gap-1.5 px-2.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 xl:px-3.5"
      :class="
        page.current
          ? 'bg-grey-900 text-white'
          : 'text-grey-300 hover:bg-grey-700 hover:text-white'
      "
    >
      <span>{{ page.label }}</span>
      <span
        v-if="page.count"
        class="rounded-full bg-grey-700 px-1.5 py-px text-[11px] tabular-nums text-grey-200"
        ><span class="sr-only">, </span>{{ page.count }}</span
      >
      <span
        v-if="page.current"
        aria-hidden="true"
        class="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-blue-500"
      ></span>
    </Link>
  </nav>

  <nav
    v-else
    aria-label="Form pages"
    class="sticky bottom-0 z-20 flex border-t border-grey-200 bg-white lg:hidden"
  >
    <Link
      v-for="page in pages"
      :key="page.label"
      :href="page.href"
      :aria-current="page.current ? 'page' : undefined"
      class="flex h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
      :class="
        page.current
          ? 'font-semibold text-blue-700'
          : 'font-medium text-grey-600 hover:bg-grey-50 active:bg-grey-100'
      "
    >
      <D9Icon class="text-lg" :name="page.icon" />
      <span class="max-w-full truncate px-1">{{ page.label }}</span>
    </Link>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Icon } from "@deck9/ui";
import { Link } from "@inertiajs/vue3";
import { useForm } from "@/stores";

withDefaults(defineProps<{ placement?: "top" | "bottom" }>(), {
  placement: "top",
});

const store = useForm();

const pages = computed(() =>
  [
    { label: "Editor", icon: "pencil-alt", route: "forms.edit" },
    { label: "Settings", icon: "cog", route: "forms.settings" },
    {
      label: "Integrations",
      icon: "puzzle-piece",
      route: "forms.integrations",
    },
    {
      label: "Submissions",
      icon: "chart-pie",
      route: "forms.submissions",
      count: store.form?.completed_sessions,
    },
  ].map((page) => {
    const href = window.route(page.route, { uuid: store.formId });
    const { origin, pathname } = document.location;

    return { ...page, href, current: origin + pathname === href };
  }),
);
</script>
