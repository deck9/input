<template>
  <div>
    <Head :title="title" />

    <jet-banner />

    <div class="flex min-h-screen flex-col bg-grey-50">
      <nav class="bg-grey-800">
        <!-- Primary Navigation Menu -->
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex h-16 justify-between">
            <div class="flex">
              <!-- Logo -->
              <div class="flex flex-shrink-0 items-center">
                <Link :href="route('dashboard')">
                  <jet-application-logo class="block h-8 w-auto text-white" />
                </Link>
              </div>
            </div>

            <div class="mx-4 flex items-center">
              <FactoryNavigation />
            </div>

            <div class="ml-6 flex items-center">
              <!-- Settings Dropdown -->
              <div class="relative ml-3">
                <jet-dropdown align="right" width="48">
                  <template #trigger>
                    <span class="inline-flex rounded-md">
                      <button
                        type="button"
                        class="inline-flex items-center rounded-md border border-transparent bg-grey-900 px-3 py-2 text-sm font-medium leading-4 text-grey-300 transition hover:text-blue-200 focus:outline-none"
                      >
                        <D9Icon class="md:hidden" name="cog" />
                        <span class="hidden md:inline-block">
                          {{ $page.props.user.name || "Account" }}
                        </span>
                        <svg
                          class="ml-2 -mr-0.5 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </template>

                  <template #content>
                    <!-- Account Management -->
                    <div class="block px-4 py-2 text-xs text-grey-400">
                      Manage Account
                    </div>

                    <jet-dropdown-link :href="route('profile.show')"
                      >Profile</jet-dropdown-link
                    >

                    <jet-dropdown-link
                      :href="route('api-tokens.index')"
                      v-if="$page.props.jetstream.hasApiFeatures"
                      >API Tokens</jet-dropdown-link
                    >

                    <jet-dropdown-link
                      as="a"
                      href="https://help.getinput.co/"
                      target="_blank"
                      >Help Center</jet-dropdown-link
                    >

                    <div class="border-t border-grey-100"></div>

                    <!-- Authentication -->
                    <form @submit.prevent="logout">
                      <jet-dropdown-link as="button">Log Out</jet-dropdown-link>
                    </form>
                  </template>
                </jet-dropdown>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Page Content -->
      <main
        class="flex w-full flex-grow justify-center"
        :class="limitHeight ? 'h-1' : ''"
      >
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import JetBanner from "@/Jetstream/Banner.vue";
import JetDropdown from "@/Jetstream/Dropdown.vue";
import JetDropdownLink from "@/Jetstream/DropdownLink.vue";
import FactoryNavigation from "@/components/Factory/FactoryNavigation.vue";
import { D9Icon } from "@deck9/ui";
import { Head, Link } from "@inertiajs/inertia-vue3";

export default defineComponent({
  props: {
    title: String,
    limitHeight: Boolean,
  },

  components: {
    Head,
    JetApplicationLogo,
    JetBanner,
    JetDropdown,
    JetDropdownLink,
    Link,
    FactoryNavigation,
    D9Icon,
  },

  data() {
    return {
      showingNavigationDropdown: false,
    };
  },

  methods: {
    switchToTeam(team: any) {
      this.$inertia.put(
        this.route("current-team.update"),
        {
          team_id: team.id,
        },
        {
          preserveState: false,
        }
      );
    },

    logout() {
      this.$inertia.post(this.route("logout"));
    },
  },
});
</script>
