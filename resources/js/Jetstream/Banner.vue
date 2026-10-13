<template>
  <div>
    <div
      :class="{
        'bg-blue-500': style == 'success',
        'bg-red-700': style == 'danger',
      }"
      :role="style == 'danger' ? 'alert' : 'status'"
      v-if="message"
    >
      <div class="max-w-screen-xl mx-auto py-2 px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between flex-wrap">
          <div class="w-0 flex-1 flex items-center min-w-0">
            <span
              class="hidden sm:flex p-2 rounded-lg mr-3"
              :class="{
                'bg-blue-600': style == 'success',
                'bg-red-600': style == 'danger',
              }"
            >
              <svg
                class="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                v-if="style == 'success'"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <svg
                class="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                v-if="style == 'danger'"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </span>

            <p class="font-medium text-sm text-white break-words">
              {{ message }}
            </p>
          </div>

          <div class="flex flex-shrink-0 items-center gap-2 sm:ml-3">
            <button
              v-if="failure && notice.canRetry"
              type="button"
              class="h-11 rounded-md bg-white px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-8"
              @click="notice.retrySaves()"
            >
              Retry
            </button>
            <!-- below lg the bar is the only sign of a failed save -->
            <button
              type="button"
              class="-mr-1 flex h-11 w-11 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:-mr-2 sm:h-9 sm:w-9 transition"
              :class="{
                'hover:bg-blue-600 focus:bg-blue-600': style == 'success',
                'hover:bg-red-600 focus:bg-red-600': style == 'danger',
                'max-lg:hidden': failure,
              }"
              aria-label="Dismiss"
              @click.prevent="dismiss"
            >
              <svg
                class="h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { useNotice } from "@/stores/notice";

export default defineComponent({
  setup() {
    return { notice: useNotice() };
  },

  data() {
    return {
      show: true,
    };
  },

  computed: {
    failure() {
      return this.notice.isBarHidden ? null : this.notice.message;
    },

    style() {
      if (this.failure) {
        return "danger";
      }

      return this.$page.props.jetstream.flash?.bannerStyle || "success";
    },

    message() {
      if (this.failure) {
        return this.failure;
      }

      return (this.show && this.$page.props.jetstream.flash?.banner) || "";
    },
  },

  methods: {
    dismiss() {
      if (this.failure) {
        // hide only: the save status, Retry and the leave prompt still need it
        this.notice.isBarHidden = true;
      } else {
        this.show = false;
      }
    },
  },
});
</script>
