<template>
  <Head title="Terms of Service" />

  <div class="font-sans text-grey-900 antialiased">
    <div class="bg-grey-100 pt-4">
      <div class="flex min-h-screen flex-col items-center pt-6 sm:pt-0">
        <div>
          <jet-application-logo class="mx-auto h-8" />
        </div>

        <div
          v-html="terms"
          class="prose mt-6 w-full overflow-hidden bg-white p-6 shadow-md sm:max-w-2xl sm:rounded-lg"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { Head } from "@inertiajs/inertia-vue3";
import JetApplicationLogo from "@/Jetstream/ApplicationLogo.vue";

export default defineComponent({
  props: ["terms"],

  components: {
    Head,
    JetApplicationLogo,
  },
});
</script>
