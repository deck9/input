<template>
  <Head title="Forgot Password" />

  <jet-authentication-card>
    <template #logo>
      <jet-application-logo class="mx-auto h-8 text-white" />
    </template>

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Forgot your password?
    </h1>

    <div class="mb-4 text-sm text-grey-400">
      No problem. Just let us know your email address and we will email you a
      password reset link that will allow you to choose a new one.
    </div>

    <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
      {{ status }}
    </div>

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

      <div class="mt-4 flex items-center justify-end">
        <d9-button
          type="submit"
          color="dark"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Email Password Reset Link"
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
    status: String,
  },

  data() {
    return {
      form: this.$inertia.form({
        email: "",
      }),
    };
  },

  methods: {
    submit() {
      this.form.post(this.route("password.email"));
    },
  },
});
</script>
