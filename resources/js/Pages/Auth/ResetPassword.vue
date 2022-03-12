<template>
  <Head title="Reset Password" />

  <jet-authentication-card>
    <template #logo>
      <jet-application-logo mode="dark" class="mx-auto h-8" />
    </template>

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Set a new password
    </h1>

    <jet-validation-errors class="mb-4" />

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
          autocomplete="new-password"
        />
      </div>

      <div class="mt-4">
        <d9-label for="password_confirmation" label="Confirm Password" />
        <d9-input
          id="password_confirmation"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password_confirmation"
          required
          autocomplete="new-password"
        />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <d9-button
          type="submit"
          color="dark"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Reset Password"
        />
      </div>
    </form>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import { Head } from "@inertiajs/inertia-vue3";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { D9Button, D9Input, D9Label } from "@deck9/ui";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";

export default defineComponent({
  components: {
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    D9Button,
    D9Input,
    D9Label,
    JetValidationErrors,
  },

  props: {
    email: String,
    token: String,
  },

  data() {
    return {
      form: this.$inertia.form({
        token: this.token,
        email: this.email,
        password: "",
        password_confirmation: "",
      }),
    };
  },

  methods: {
    submit() {
      this.form.post(this.route("password.update"), {
        onFinish: () => this.form.reset("password", "password_confirmation"),
      });
    },
  },
});
</script>
