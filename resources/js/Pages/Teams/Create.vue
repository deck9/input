<template>
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
      Create Team
    </h1>

    <p>Create a new team to collaborate with others on projects.</p>

    <div class="col-span-6">
      <d9-label label="Team Owner" />

      <div class="mt-2 flex items-center">
        <img
          class="h-12 w-12 rounded-full object-cover"
          :src="$page.props.user.profile_photo_url"
          :alt="$page.props.user.name"
        />

        <div class="ml-4 leading-tight">
          <div>{{ $page.props.user.name }}</div>
          <div class="text-sm text-grey-700">
            {{ $page.props.user.email }}
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-6 sm:col-span-4">
      <d9-label for="name" label="Team Name" />
      <d9-input
        id="name"
        type="text"
        class="mt-1 block w-full"
        v-model="form.name"
        autofocus
        block
      />
    </div>

    <d9-button
      type="submit"
      class="ml-4"
      :isLoading="form.processing"
      :disabled="form.processing"
      label="Log in"
      color="dark"
    >
    </d9-button>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";
import { D9Input, D9Label, D9Button } from "@deck9/ui";

export default defineComponent({
  components: {
    JetAuthenticationCard,
    JetValidationErrors,
    D9Input,
    D9Label,
    D9Button,
  },

  data() {
    return {
      form: this.$inertia.form({
        name: "",
      }),
    };
  },

  methods: {
    createTeam() {
      this.form.post(route("teams.store"), {
        errorBag: "createTeam",
        preserveScroll: true,
      });
    },
  },
});
</script>
