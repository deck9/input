<template>
  <Head title="Log in" />

  <jet-authentication-card>
    <template #logo>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <jet-application-logo class="mx-auto h-8 text-white" />
      </div>
    </template>

    <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
      {{ status }}
    </div>

    <jet-validation-errors class="mb-6" />

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">Sign In</h1>

    <form @submit.prevent="submit">
      <div>
        <d9-label for="email" label="Email" />
        <d9-input
          id="email"
          type="email"
          class="mt-1 block w-full"
          v-model="form.email"
          required
          autofocus
        />
      </div>

      <div class="mt-4">
        <d9-label for="password" label="Password" />
        <d9-input
          id="password"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password"
          required
          autocomplete="current-password"
        />
      </div>

      <div class="mt-4 block">
        <label class="flex items-center">
          <d9-checkbox
            name="remember"
            v-model:checked="form.remember"
            label="Remember me"
          />
        </label>
      </div>

      <div class="mt-4 flex items-center justify-end">
        <d9-button
          type="submit"
          class="ml-4"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Log in"
          color="dark"
        >
        </d9-button>
      </div>
    </form>

    <div class="text-sm text-grey-500">
      No account yet?
      <Link
        class="text-sm text-grey-400 underline hover:text-grey-200"
        :href="route('register')"
        >Create a new account</Link
      >
    </div>
    <div class="mt-2 text-sm text-grey-500">
      Forgot your password?
      <Link
        v-if="canResetPassword"
        :href="route('password.request')"
        class="text-sm text-grey-400 underline hover:text-grey-200"
      >
        Reset it
      </Link>
    </div>
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
    D9Input,
    D9Label,
    D9Checkbox,
    D9Button,
    JetValidationErrors,
    Link,
  },

  props: {
    canResetPassword: Boolean,
    status: String,
  },

  data() {
    return {
      form: this.$inertia.form({
        email: "",
        password: "",
        remember: false,
      }),
    };
  },

  methods: {
    submit() {
      this.form
        .transform((data) => ({
          ...data,
          remember: this.form.remember ? "on" : "",
        }))
        .post(this.route("login"), {
          onFinish: () => this.form.reset("password"),
        });
    },
  },
});
</script>
