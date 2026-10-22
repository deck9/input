<template>
  <!-- the banner and the page share one window-high column, so the banner takes
    its space from the page instead of adding to its height -->
  <div class="flex min-h-screen flex-col supports-[height:100dvh]:min-h-dvh">
    <Head :title="title" />

    <jet-banner />

    <div class="flex flex-grow flex-col bg-grey-50">
      <FormTopBar v-if="form.formId">
        <template #save-status><slot name="save-status" /></template>
        <template #preview><slot name="preview" /></template>
      </FormTopBar>

      <nav v-else class="bg-grey-800">
        <!-- Primary Navigation Menu -->
        <div class="mx-auto px-4 lg:pl-4 lg:pr-3">
          <div class="flex h-bar items-center justify-between">
            <!-- Logo; a long team name shortens, so the menus fit -->
            <div class="mr-3 flex min-w-0 items-center sm:mr-6">
              <Link
                class="flex h-11 min-w-0 items-center lg:px-1"
                :href="route('dashboard')"
              >
                <jet-application-logo
                  class="block h-8 w-auto flex-shrink-0 text-white"
                />
                <span
                  dir="auto"
                  class="ml-3 truncate py-0.5 text-white text-xs uppercase font-bold leading-none"
                >
                  {{ $page.props.auth.user.current_team.name }}
                </span>
              </Link>
            </div>

            <!-- Settings Dropdown -->
            <div class="relative ml-3">
              <jet-dropdown align="right" width="48">
                <template #trigger>
                  <span class="inline-flex rounded-md">
                    <button
                      type="button"
                      class="inline-flex h-11 items-center rounded-md border border-transparent bg-grey-900 px-3 py-2 text-sm font-medium leading-4 text-grey-300 ring-offset-2 ring-offset-grey-800 transition hover:text-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:h-auto"
                    >
                      <D9Icon class="md:hidden" name="user" />
                      <span v-if="$page.props.auth.user.name" class="sr-only"
                        >Account:
                      </span>
                      <span class="sr-only md:not-sr-only md:inline-block">
                        {{ $page.props.auth.user.name || "Account" }}
                      </span>
                      <svg
                        class="-mr-0.5 ml-2 h-4 w-4"
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
                    :href="
                      route('teams.show', $page.props.auth.user.current_team)
                    "
                  >
                    Manage Team
                  </jet-dropdown-link>

                  <jet-dropdown-link
                    :href="route('api-tokens.index')"
                    v-if="$page.props.jetstream.hasApiFeatures"
                    >API Tokens</jet-dropdown-link
                  >

                  <div class="border-t border-grey-100"></div>
                  <div class="block px-4 py-2 text-xs text-grey-400">Help</div>

                  <jet-dropdown-link as="a" href="/docs" target="_blank"
                    >API Reference <D9Icon size="xs" name="external-link"
                  /></jet-dropdown-link>

                  <jet-dropdown-link
                    as="a"
                    href="https://help.getinput.co/"
                    target="_blank"
                    >Help Center <D9Icon size="xs" name="external-link"
                  /></jet-dropdown-link>

                  <jet-dropdown-link
                    as="a"
                    href="https://getinput.co/changelog"
                    target="_blank"
                    >Changelog <D9Icon size="xs" name="external-link"
                  /></jet-dropdown-link>

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
      </nav>

      <!-- Page Content -->
      <main
        class="flex w-full flex-grow justify-center"
        :class="limitHeight ? 'h-1' : ''"
      >
        <slot></slot>
      </main>

      <FormPageTabs v-if="form.formId" placement="bottom" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import JetBanner from "@/Jetstream/Banner.vue";
import JetDropdown from "@/Jetstream/Dropdown.vue";
import JetDropdownLink from "@/Jetstream/DropdownLink.vue";
import FormPageTabs from "@/components/Factory/TopBar/FormPageTabs.vue";
import FormTopBar from "@/components/Factory/TopBar/FormTopBar.vue";
import { useForm } from "@/stores";
import { D9Icon } from "@deck9/ui";
import { Head, Link } from "@inertiajs/vue3";

export default defineComponent({
  props: {
    title: String,
    limitHeight: Boolean,
  },

  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetApplicationLogo,
    JetBanner,
    JetDropdown,
    JetDropdownLink,
    // eslint-disable-next-line vue/no-reserved-component-names
    Link,
    FormPageTabs,
    FormTopBar,
    D9Icon,
  },

  setup() {
    // a form's pages set the form; the dashboard has none
    return { form: useForm() };
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
        },
      );
    },

    logout() {
      this.$inertia.post(this.route("logout"));
    },
  },
});
</script>
