<template>
  <Head title="Terms of Service" />

  <div class="font-sans text-gray-900 antialiased">
    <div class="pt-4 bg-gray-100">
      <div class="min-h-screen flex flex-col items-center pt-6 sm:pt-0">
        <div>
          <jet-application-logo class="h-8 mx-auto" />
        </div>

        <div
          v-html="terms"
          class="
            w-full
            sm:max-w-2xl
            mt-6
            p-6
            bg-white
            shadow-md
            overflow-hidden
            sm:rounded-lg
            prose
          "
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
