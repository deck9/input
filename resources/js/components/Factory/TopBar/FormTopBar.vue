<template>
  <!-- One bar for a form's pages: breadcrumb, pages, then status and actions.
    Under lg the pages move to FormPageTabs at the bottom. -->
  <header
    class="relative flex h-14 flex-none items-center gap-1 bg-grey-800 px-1 text-grey-300 lg:gap-4 lg:pl-4 lg:pr-3"
  >
    <Link
      :href="route('dashboard')"
      aria-label="All forms"
      class="flex h-11 w-11 flex-none items-center justify-center rounded-md text-white hover:bg-grey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:hidden"
    >
      <D9Icon name="chevron-left" />
    </Link>

    <nav
      aria-label="Breadcrumb"
      class="flex min-w-0 flex-[1_1_auto] items-center gap-2"
    >
      <Link
        :href="route('dashboard')"
        aria-label="All forms"
        class="hidden h-11 flex-none items-center rounded-md px-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex"
      >
        <JetApplicationLogo class="h-8 w-auto" />
      </Link>
      <!-- the team is in the account menu too -->
      <span aria-hidden="true" class="hidden text-grey-500 xl:block">/</span>
      <!-- the form name gives way first -->
      <span
        dir="auto"
        class="hidden max-w-[160px] flex-none truncate text-sm xl:block"
        >{{ $page.props.auth.user.current_team.name }}</span
      >
      <span aria-hidden="true" class="hidden text-grey-500 lg:block">/</span>
      <FormMenu />
      <span
        class="inline-flex h-[22px] flex-none items-center gap-1.5 rounded-full px-2 text-xs font-semibold"
        :class="
          store.form?.is_published
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        "
        ><span
          aria-hidden="true"
          class="h-1.5 w-1.5 rounded-full bg-current"
        ></span
        >{{ store.form?.is_published ? "Live" : "Draft" }}</span
      >
    </nav>

    <FormPageTabs />

    <div
      class="flex flex-none items-center justify-end gap-1 lg:flex-[1_0_auto] lg:gap-2"
    >
      <slot name="save-status" />
      <slot name="preview">
        <!-- pages without the live preview: the form in preview mode
          (stores no answers) in a new tab; on phones it's in the form menu,
          so the name keeps its room -->
        <a
          :href="`${store.formUrl}?preview=1`"
          target="_blank"
          rel="noopener"
          class="hidden h-9 w-9 flex-none items-center justify-center gap-1.5 rounded-md border border-grey-600 text-[13px] font-semibold text-white hover:bg-grey-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 lg:flex xl:w-auto xl:px-2.5"
          ><D9Icon name="eye" /><span class="sr-only xl:not-sr-only"
            >Preview</span
          ><span aria-hidden="true" class="hidden xl:inline">↗</span
          ><span class="sr-only">&nbsp;(opens in a new tab)</span></a
        >
      </slot>
      <PublishControl />
      <AccountMenu :user="$page.props.auth.user" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { D9Icon } from "@deck9/ui";
import { Link } from "@inertiajs/vue3";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { useForm } from "@/stores";
import AccountMenu from "./AccountMenu.vue";
import FormMenu from "./FormMenu.vue";
import FormPageTabs from "./FormPageTabs.vue";
import PublishControl from "./PublishControl.vue";

const store = useForm();
</script>
