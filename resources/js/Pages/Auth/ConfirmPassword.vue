<template>
  <Head title="Secure Area" />

  <jet-authentication-card>
    <template #logo>
      <jet-application-logo class="mx-auto h-8" />
    </template>

    <div class="mb-4 text-sm text-grey-600">
      This is a secure area of the application. Please confirm your password
      before continuing.
    </div>

    <jet-validation-errors class="mb-4" />

    <form @submit.prevent="submit">
      <div>
        <jet-label for="password" value="Password" />
        <jet-input
          id="password"
          type="password"
          class="mt-1 block w-full"
          v-model="form.password"
          required
          autocomplete="current-password"
          autofocus
        />
      </div>

      <div class="mt-4 flex justify-end">
        <jet-button
          class="ml-4"
          :class="{ 'opacity-25': form.processing }"
          :disabled="form.processing"
        >
          Confirm
        </jet-button>
      </div>
    </form>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import { Head } from "@inertiajs/inertia-vue3";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import JetButton from "@/Jetstream/Button.vue";
import JetInput from "@/Jetstream/Input.vue";
import JetLabel from "@/Jetstream/Label.vue";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    JetButton,
    JetInput,
    JetLabel,
    JetValidationErrors,
  },

  data() {
    return {
      form: this.$inertia.form({
        password: "",
      }),
    };
  },

  methods: {
    submit() {
      this.form.post(this.route("password.confirm"), {
        onFinish: () => this.form.reset(),
      });
    },
  },
});
</script>
