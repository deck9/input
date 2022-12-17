<template>
  <Head title="Register" />

  <jet-authentication-card>
    <template #logo>
      <jet-application-logo class="mx-auto h-8 text-white" />
    </template>

    <jet-validation-errors class="mb-6" />

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Create your account
    </h1>

    <form @submit.prevent="submit">
      <div class="mt-4">
        <d9-label for="email" label="Email" />
        <d9-input
          id="email"
          type="email"
          class="mt-1 block w-full"
          v-model="form.email"
          block
          required
        />
      </div>

      <div class="mt-4">
        <d9-label for="password" label="Password" />
        <d9-input
          id="password"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password"
          block
          required
          autocomplete="new-password"
        />
      </div>

      <div
        class="mt-4"
        v-if="$page.props.jetstream.hasTermsAndPrivacyPolicyFeature"
      >
        <div class="flex items-center">
          <d9-checkbox name="terms" id="terms" v-model="form.terms" />
          <label for="terms" class="ml-2 text-grey-500">
            I agree to the
            <a
              target="_blank"
              :href="route('terms.show')"
              class="text-sm text-grey-400 underline hover:text-grey-200"
              >Terms of Service</a
            >
            and
            <a
              target="_blank"
              :href="route('policy.show')"
              class="text-sm text-grey-400 underline hover:text-grey-200"
              >Privacy Policy</a
            >
          </label>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between">
        <Link
          :href="route('login')"
          class="text-sm text-grey-400 underline hover:text-grey-200"
        >
          Already registered?
        </Link>

        <d9-button
          type="submit"
          class="ml-4"
          color="dark"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Register"
        />
      </div>
    </form>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { D9Input, D9Label, D9Checkbox, D9Button } from "@deck9/ui";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";
import { Head, Link } from "@inertiajs/inertia-vue3";

export default defineComponent({
  components: {
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    D9Button,
    D9Input,
    D9Checkbox,
    D9Label,
    JetValidationErrors,
    Link,
  },

  data() {
    return {
      form: this.$inertia.form({
        email: "",
        password: "",
        terms: false,
      }),
    };
  },

  methods: {
    submit() {
      this.form.post(this.route("register"), {
        onFinish: () => this.form.reset("password", "password_confirmation"),
      });
    },
  },
});
</script>
