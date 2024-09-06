<template>
  <jet-form-section @submitted="createTeam">
    <template #title> Team Details </template>

    <template #description>
      Create a new team to collaborate with others on projects.
    </template>

    <template #form>
      <div class="col-span-6">
        <jet-label value="Team Owner" />

        <div class="mt-2 flex items-center">
          <img
            class="h-12 w-12 rounded-full object-cover"
            :src="$page.props.auth.user.profile_photo_url"
            :alt="$page.props.auth.user.name"
          />

          <div class="ml-4 leading-tight">
            <div>{{ $page.props.auth.user.name }}</div>
            <div class="text-sm text-grey-700">
              {{ $page.props.auth.user.email }}
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-6 sm:col-span-4">
        <jet-label for="name" value="Team Name" />
        <jet-input
          id="name"
          type="text"
          class="mt-1 block w-full"
          v-model="form.name"
          autofocus
        />
        <jet-input-error :message="form.errors.name" class="mt-2" />
      </div>
    </template>

    <template #actions>
      <jet-button
        :class="{ 'opacity-25': form.processing }"
        :disabled="form.processing"
      >
        Create
      </jet-button>
    </template>
  </jet-form-section>
</template>

<script>
import { defineComponent } from "vue";
import JetButton from "@/Jetstream/Button.vue";
import JetFormSection from "@/Jetstream/FormSection.vue";
import JetInput from "@/Jetstream/Input.vue";
import JetInputError from "@/Jetstream/InputError.vue";
import JetLabel from "@/Jetstream/Label.vue";

export default defineComponent({
  components: {
    JetButton,
    JetFormSection,
    JetInput,
    JetInputError,
    JetLabel,
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
