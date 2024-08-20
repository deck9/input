<template>
  <Head title="Two-factor Confirmation" />

  <jet-authentication-card>
    <template #logo>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <jet-application-logo class="mx-auto h-8 text-white" />
      </div>
    </template>

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Two Factor Verification
    </h1>

    <div class="mb-4 text-sm text-grey-400">
      <template v-if="!recovery">
        Please confirm access to your account by entering the authentication
        code provided by your authenticator application.
      </template>

      <template v-else>
        Please confirm access to your account by entering one of your emergency
        recovery codes.
      </template>
    </div>

    <jet-validation-errors class="mb-4" />

    <form @submit.prevent="submit">
      <div v-if="!recovery">
        <d9-label for="code" label="Code" />
        <d9-input
          ref="code"
          id="code"
          type="text"
          inputmode="numeric"
          class="mt-1 block w-full"
          v-model="form.code"
          block
          required
          autofocus
          autocomplete="one-time-code"
        />
      </div>

      <div v-else>
        <d9-label for="recovery_code" label="Recovery Code" />
        <d9-input
          ref="recovery_code"
          id="recovery_code"
          type="text"
          class="mt-1 block w-full"
          v-model="form.recovery_code"
          block
          autocomplete="one-time-code"
        />
      </div>

      <div class="mt-4 flex items-center justify-end">
        <button
          type="button"
          class="cursor-pointer text-sm text-grey-400 underline hover:text-grey-200"
          @click.prevent="toggleRecovery"
        >
          <template v-if="!recovery"> Use a recovery code </template>

          <template v-else> Use an authentication code </template>
        </button>

        <d9-button
          class="ml-4"
          :isLoading="form.processing"
          :disabled="form.processing"
          label="Log in"
          color="dark"
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
import { D9Input, D9Label, D9Button } from "@deck9/ui";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    D9Button,
    D9Input,
    D9Label,
    JetValidationErrors,
  },

  data() {
    return {
      recovery: false,
      form: this.$inertia.form({
        code: "",
        recovery_code: "",
      }),
    };
  },

  methods: {
    toggleRecovery() {
      this.recovery ^= true;

      this.$nextTick(() => {
        if (this.recovery) {
          this.$refs.recovery_code.focus();
          this.form.code = "";
        } else {
          this.$refs.code.focus();
          this.form.recovery_code = "";
        }
      });
    },

    submit() {
      this.form.post(this.route("two-factor.login"));
    },
  },
});
</script>
