<template>
  <div>
    <Head :title="title" />

    <jet-banner />

    <div class="min-h-screen bg-gray-100 flex flex-col">
      <nav class="bg-grey-800">
        <!-- Primary Navigation Menu -->
        <div class="mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex">
              <!-- Logo -->
              <div class="flex-shrink-0 flex items-center">
                <Link :href="route('dashboard')">
                  <jet-application-logo mode="dark" class="block h-5 w-auto" />
                </Link>
              </div>

              <!-- Navigation Links -->
              <div class="space-x-8 -my-px ml-10 flex">
                <jet-nav-link
                  :href="route('dashboard')"
                  :active="route().current('dashboard')"
                  >Dashboard</jet-nav-link
                >
              </div>
            </div>

            <div class="flex items-center mx-4">
              <FactoryNavigation />
            </div>

            <div class="flex items-center ml-6">
              <FormMenuActions class="mr-3" />

              <!-- Settings Dropdown -->
              <div class="ml-3 relative">
                <jet-dropdown align="right" width="48">
                  <template #trigger>
                    <button
                      v-if="$page.props.jetstream.managesProfilePhotos"
                      class="
                        flex
                        text-sm
                        border-2 border-transparent
                        rounded-full
                        focus:outline-none focus:border-gray-300
                        transition
                      "
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
                        class="
                          inline-flex
                          items-center
                          px-3
                          py-2
                          border border-transparent
                          text-sm
                          leading-4
                          font-medium
                          rounded-md
                          text-grey-300
                          bg-grey-900
                          hover:text-blue-200
                          focus:outline-none
                          transition
                        "
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
                    <div class="block px-4 py-2 text-xs text-gray-400">
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
      <main
        class="flex flex-grow justify-center w-full"
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
import JetNavLink from "@/Jetstream/NavLink.vue";
import FormMenuActions from "@/components/Factory/FormMenuActions.vue";
import FactoryNavigation from "@/components/Factory/FactoryNavigation.vue";
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
    Link,
    FormMenuActions,
    FactoryNavigation,
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
