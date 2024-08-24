<template>
  <Head title="Email Verification" />

  <jet-authentication-card>
    <template #logo>
      <jet-application-logo class="mx-auto h-8 text-white" />
    </template>

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Verify your email
    </h1>

    <div class="mb-4 text-sm text-grey-400">
      Thanks for signing up! Before getting started, could you verify your email
      address by clicking on the link we just emailed to you? If you didn't
      receive the email, we will gladly send you another.
    </div>

    <div
      class="mb-4 text-sm font-medium text-green-600"
      v-if="verificationLinkSent"
    >
      A new verification link has been sent to the email address you provided
      during registration.
    </div>

    <form @submit.prevent="submit">
      <div class="mt-4 flex items-center justify-between">
        <d9-button
          type="submit"
          color="dark"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Resend Verification Email"
        />

        <Link
          :href="route('logout')"
          method="post"
          as="button"
          class="text-sm text-grey-400 underline hover:text-grey-200"
          >Log Out</Link
        >
      </div>
    </form>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { D9Button } from "@deck9/ui";
import { Head, Link } from "@inertiajs/vue3";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    D9Button,
    // eslint-disable-next-line vue/no-reserved-component-names
    Link,
  },

  props: {
    status: String,
  },

  data() {
    return {
      form: this.$inertia.form(),
    };
  },

  methods: {
    submit() {
      this.form.post(this.route("verification.send"));
    },
  },

  computed: {
    verificationLinkSent() {
      return this.status === "verification-link-sent";
    },
  },
});
</script>
