<template>
  <Head title="You need to be in a team to continue" />

  <jet-authentication-card>
    <template #logo>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <jet-application-logo class="mx-auto h-8 text-white" />
        <div class="flex justify-center mt-4">
          <button
            @click="logout"
            type="button"
            class="text-grey-400 hover:text-blue-100 text-sm underline"
          >
            Logout
          </button>
        </div>
      </div>
    </template>

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Join a Team to Get Started
    </h1>

    <div
      class="border-indigo-80 mb-6 rounded border border-indigo-700 bg-indigo-900 px-4 py-6 text-indigo-300 form-message-prose"
    >
      <p>
        To begin using Input, you need to be part of a team. Currently, you're
        not in a team, which is a necessary step to access Input's capabilities.
      </p>
      <p>
        If you've been invited to join a team, please check your email for the
        invitation link.
      </p>
      <p>
        If you haven't received an invite yet, reach out to your team
        administrator or the person managing your self-hosted instance to
        request access.
      </p>
    </div>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import { Head } from "@inertiajs/vue3";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
  },

  methods: {
    logout() {
      console.log("logout");
      this.$inertia.post(this.route("logout"));
    },
  },
});
</script>
