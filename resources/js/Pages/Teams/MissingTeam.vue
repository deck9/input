<template>
  <Head title="You need to be in a team to continue" />

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

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Join a Team to Get Started
    </h1>

    <div
      class="border-indigo-80 mb-6 rounded border border-indigo-700 bg-indigo-900 px-4 py-6 text-indigo-300 prose"
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
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { D9Input, D9Label, D9Checkbox, D9Button } from "@deck9/ui";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";
import { Head, Link } from "@inertiajs/inertia-vue3";

export default defineComponent({
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Head,
    JetAuthenticationCard,
    JetApplicationLogo,
    D9Input,
    D9Label,
    D9Checkbox,
    D9Button,
    JetValidationErrors,
    // eslint-disable-next-line vue/no-reserved-component-names
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
