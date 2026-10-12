<template>
  <div v-if="store.formId" class="xl:hidden">
    <!-- Under xl the form's navigation gets two rows under the app header:
      the form, then its pages as tabs. From xl FactoryNavigation shows it
      in the header. -->
    <div
      class="relative flex h-14 items-center gap-2 border-t border-grey-700 px-4 sm:px-6"
    >
      <Link
        :href="route('dashboard')"
        aria-label="Dashboard"
        class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded text-grey-300 hover:bg-grey-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-grey-800 active:bg-grey-900"
      >
        <D9Icon name="chevron-left" />
      </Link>

      <FactoryFormDropdown class="min-w-0 flex-1" />

      <a
        :href="store.formUrl"
        target="_blank"
        rel="noopener"
        aria-label="Preview (opens in a new tab)"
        class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded text-grey-300 hover:bg-grey-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-grey-800 active:bg-grey-900"
      >
        <D9Icon name="play-circle" />
      </a>
    </div>

    <ul
      aria-label="Form pages"
      class="grid grid-cols-4 gap-1 px-2 sm:flex sm:px-6"
    >
      <li v-for="page in pages" :key="page.label" class="sm:w-28">
        <Link
          :href="page.href"
          :aria-current="page.current ? 'page' : undefined"
          class="relative flex h-12 min-w-0 flex-col items-center justify-center gap-1 rounded-t-md text-xs font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
          :class="
            page.current
              ? 'bg-grey-900 text-white'
              : 'text-grey-300 hover:bg-grey-700 hover:text-white active:bg-grey-900'
          "
        >
          <D9Icon class="text-base" :name="page.icon" />
          <span class="max-w-full truncate px-1">{{ page.label }}</span>
          <span
            v-if="page.current"
            aria-hidden="true"
            class="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"
          ></span>
        </Link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { D9Icon } from "@deck9/ui";
import { Link } from "@inertiajs/vue3";
import { useForm } from "@/stores";
import FactoryFormDropdown from "./FactoryFormDropdown.vue";

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
    { label: "Submissions", icon: "chart-pie", route: "forms.submissions" },
  ].map((page) => {
    const href = window.route(page.route, { uuid: store.formId });
    const { origin, pathname } = document.location;

    // the same check NavigationButton uses for the desktop bar
    return { ...page, href, current: origin + pathname === href };
  }),
);
</script>
