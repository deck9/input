<template>
  <!-- the D9 menu button hides its outline: ring the avatar instead -->
  <D9Menu
    class="!flex flex-none [&>button:focus-visible>span]:ring-2 [&>button:focus-visible>span]:ring-blue-500"
    position="left"
    use-portal
  >
    <template #button>
      <span
        class="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-grey-700"
      >
        <span class="sr-only">{{
          user.name ? `Account: ${user.name}` : "Account"
        }}</span>
        <span
          aria-hidden="true"
          class="grid h-8 w-8 place-items-center rounded-full bg-grey-600 text-xs font-bold text-white"
          >{{ initials }}</span
        >
      </span>
    </template>
    <div class="px-4 py-2">
      <p
        v-if="user.name"
        dir="auto"
        class="truncate text-sm font-semibold text-grey-900"
      >
        {{ user.name }}
      </p>
      <p class="truncate text-xs text-grey-600">{{ user.email }}</p>
    </div>
    <p dir="auto" class="mb-1 truncate rounded bg-grey-50 px-4 py-1.5 text-xs">
      Team: {{ user.current_team.name }}
    </p>
    <D9MenuLink
      as="a"
      :href="route('profile.show')"
      :class="menuItem"
      label="Profile"
    />
    <D9MenuLink
      as="a"
      :href="route('teams.show', user.current_team)"
      :class="menuItem"
      label="Manage team"
    />
    <D9MenuLink
      v-if="$page.props.jetstream.hasApiFeatures"
      as="a"
      :href="route('api-tokens.index')"
      :class="menuItem"
      label="API tokens"
    />
    <div role="separator" class="my-1 h-px bg-grey-100"></div>
    <p class="px-4 pb-0.5 pt-1.5 text-xs text-grey-500">Help</p>
    <D9MenuLink
      v-for="link in help"
      :key="link.label"
      as="a"
      :href="link.href"
      target="_blank"
      :class="menuItem"
      :label="`${link.label} ↗`"
      :aria-label="`${link.label} (opens in a new tab)`"
    />
    <div role="separator" class="my-1 h-px bg-grey-100"></div>
    <D9MenuLink
      as="button"
      type="button"
      :class="menuItem"
      label="Log out"
      @click="router.post(route('logout'))"
    />
  </D9Menu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { router } from "@inertiajs/vue3";
import { D9Menu, D9MenuLink } from "@deck9/ui";

const props = defineProps<{
  // Input asks only for an email at sign-up, the name comes later
  user: { name: string | null; email: string; current_team: { name: string } };
}>();

// as on the dashboard: 44 px rows on phones
const menuItem = "block w-full text-left !py-3 !text-sm lg:!py-2";

const help = [
  { label: "API reference", href: "/docs" },
  { label: "Help center", href: "https://help.getinput.co/" },
  { label: "Changelog", href: "https://getinput.co/changelog" },
];

const initials = computed(() => {
  const words = (props.user.name || props.user.email).trim().split(/\s+/);
  const first = words[0]?.[0] ?? "";
  const last = words.length > 1 ? words[words.length - 1][0] : "";

  return (first + last).toUpperCase();
});
</script>
