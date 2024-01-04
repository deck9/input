<template>
  <jet-authentication-card>
    <template #logo>
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <jet-application-logo class="mx-auto h-8 text-white" />
      </div>
    </template>

    <jet-validation-errors class="mb-6" />

    <h1 class="mb-6 text-center text-2xl font-bold text-grey-300">
      Create Team
    </h1>

    <p class="mb-4 text-sm text-grey-400">
      Create a new team to collaborate with others on projects.
    </p>

    <form @submit.prevent="createTeam">
      <div class="col-span-6">
        <d9-label label="Team Owner" />
        <div class="flex items-center mt-1">
          <img
            class="h-10 w-10 rounded-full object-cover bg-grey-950"
            :src="$page.props.user.profile_photo_url"
            :alt="$page.props.user.name"
          />
          <div class="ml-2 leading-tight">
            <div>{{ $page.props.user.name }}</div>
            <div class="text-sm text-grey-400">
              {{ $page.props.user.email }}
            </div>
          </div>
        </div>
      </div>
      <div class="mt-4">
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
        class="mt-4"
        :isLoading="form.processing"
        :disabled="form.processing"
        label="Create Team"
        color="dark"
      >
      </d9-button>
    </form>
  </jet-authentication-card>
</template>

<script>
import { defineComponent } from "vue";
import JetAuthenticationCard from "@/Jetstream/AuthenticationCard.vue";
import JetValidationErrors from "@/Jetstream/ValidationErrors.vue";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";
import { D9Input, D9Label, D9Button } from "@deck9/ui";

export default defineComponent({
  components: {
    JetAuthenticationCard,
    JetApplicationLogo,
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
