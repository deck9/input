<template>
  <div>
    <Head :title="title" />

    <jet-banner />

    <div class="min-h-screen bg-gray-100 flex flex-col">
      <nav class="bg-grey-800">
        <!-- Primary Navigation Menu -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <!-- Logo -->
              <div class="flex-shrink-0 flex items-center">
                <Link :href="route('dashboard')">
                  <jet-application-logo mode="dark" class="block h-5 w-auto" />
                </Link>
              </div>

              <!-- Navigation Links -->
              <div class="space-x-8 sm:-my-px sm:ml-10 sm:flex">
                <jet-nav-link
                  :href="route('dashboard')"
                  :active="route().current('dashboard')"
                >Dashboard</jet-nav-link>
              </div>
            </div>

            <div class="flex sm:items-center sm:ml-6">
              <div class="ml-3 relative">
                <!-- Teams Dropdown -->
                <jet-dropdown align="right" width="60" v-if="$page.props.jetstream.hasTeamFeatures">
                  <template #trigger>
                    <span class="inline-flex rounded-md">
                      <button
                        type="button"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:bg-gray-50 active:bg-gray-50 transition"
                      >
                        {{ $page.props.user.current_team.name }}
                        <svg
                          class="ml-2 -mr-0.5 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </template>

                  <template #content>
                    <div class="w-60">
                      <!-- Team Management -->
                      <template v-if="$page.props.jetstream.hasTeamFeatures">
                        <div class="block px-4 py-2 text-xs text-gray-400">Manage Team</div>

                        <!-- Team Settings -->
                        <jet-dropdown-link
                          :href="
                            route('teams.show', $page.props.user.current_team)
                          "
                        >Team Settings</jet-dropdown-link>

                        <jet-dropdown-link
                          :href="route('teams.create')"
                          v-if="$page.props.jetstream.canCreateTeams"
                        >Create New Team</jet-dropdown-link>

                        <div class="border-t border-gray-100"></div>

                        <!-- Team Switcher -->
                        <div class="block px-4 py-2 text-xs text-gray-400">Switch Teams</div>

                        <template v-for="team in $page.props.user.all_teams" :key="team.id">
                          <form @submit.prevent="switchToTeam(team)">
                            <jet-dropdown-link as="button">
                              <div class="flex items-center">
                                <svg
                                  v-if="
                                    team.id == $page.props.user.current_team_id
                                  "
                                  class="mr-2 h-5 w-5 text-green-400"
                                  fill="none"
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  stroke-width="2"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>{{ team.name }}</div>
                              </div>
                            </jet-dropdown-link>
                          </form>
                        </template>
                      </template>
                    </div>
                  </template>
                </jet-dropdown>
              </div>

              <!-- Settings Dropdown -->
              <div class="ml-3 relative">
                <jet-dropdown align="right" width="48">
                  <template #trigger>
                    <button
                      v-if="$page.props.jetstream.managesProfilePhotos"
                      class="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition"
                    >
                      <img
                        class="h-8 w-8 rounded-full object-cover"
                        :src="$page.props.user.profile_photo_url"
                        :alt="$page.props.user.name"
                      />
                    </button>

                    <span v-else class="inline-flex rounded-md">
                      <button
                        type="button"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-grey-300 bg-grey-900 hover:text-blue-200 focus:outline-none transition"
                      >
                        {{ $page.props.user.name }}
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
                    <div class="block px-4 py-2 text-xs text-gray-400">Manage Account</div>

                    <jet-dropdown-link :href="route('profile.show')">Profile</jet-dropdown-link>

                    <jet-dropdown-link
                      :href="route('api-tokens.index')"
                      v-if="$page.props.jetstream.hasApiFeatures"
                    >API Tokens</jet-dropdown-link>

                    <div class="border-t border-gray-100"></div>

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
      <main class="flex flex-grow justify-center w-full" :class="limitHeight ? 'h-1' : ''">
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
import JetNavLink from "@/Jetstream/NavLink.vue";
import JetResponsiveNavLink from "@/Jetstream/ResponsiveNavLink.vue";
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
    JetNavLink,
    JetResponsiveNavLink,
    Link,
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
