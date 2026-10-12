<template>
  <teleport to="body">
    <transition leave-active-class="duration-200">
      <div
        v-show="show"
        class="fixed inset-0 z-50 overflow-y-auto px-4 py-6 sm:px-0"
        scroll-region
      >
        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-show="show"
            class="fixed inset-0 transition-all"
            @click="close"
          >
            <div class="absolute inset-0 bg-grey-500 opacity-75"></div>
          </div>
        </transition>

        <transition
          enter-active-class="ease-out duration-300"
          enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-active-class="ease-in duration-200"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            v-show="show"
            ref="panel"
            class="mb-6 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:mx-auto sm:w-full"
            :class="maxWidthClass"
          >
            <slot v-if="show"></slot>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script>
import {
  defineComponent,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";

const controls =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default defineComponent({
  emits: ["close"],

  props: {
    show: {
      default: false,
    },
    maxWidth: {
      default: "2xl",
    },
    closeable: {
      default: true,
    },
  },

  watch: {
    show: {
      immediate: true,
      handler: function (show) {
        if (show) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = null;
        }
      },
    },
  },

  setup(props, { emit }) {
    const panel = ref(null);
    // the control that opened the dialog
    let opener = null;

    const close = () => {
      if (props.closeable) {
        emit("close");
      }
    };

    const closeOnEscape = (e) => {
      if (e.key === "Escape" && props.show) {
        close();
      }
    };

    // Tab and Shift+Tab cycle through the dialog's controls only
    const keepFocusInside = (e) => {
      if (e.key !== "Tab" || !props.show || !panel.value) {
        return;
      }

      const all = [...panel.value.querySelectorAll(controls)];
      const first = all[0];
      const last = all[all.length - 1];
      const active = document.activeElement;
      const isInside = panel.value.contains(active);

      if (e.shiftKey && (!isInside || active === first)) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && (!isInside || active === last)) {
        e.preventDefault();
        first?.focus();
      }
    };

    watch(
      () => props.show,
      async (show) => {
        if (show) {
          opener = document.activeElement;
          await nextTick();
          // a dialog may focus its own field first
          if (!panel.value?.contains(document.activeElement)) {
            panel.value?.querySelector(controls)?.focus();
          }
          return;
        }

        // unless the page already moved the focus elsewhere
        const active = document.activeElement;
        if (active === document.body || panel.value?.contains(active)) {
          opener?.focus();
        }
        opener = null;
      },
    );

    onMounted(() => {
      document.addEventListener("keydown", closeOnEscape);
      document.addEventListener("keydown", keepFocusInside);
    });
    onUnmounted(() => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("keydown", keepFocusInside);
      document.body.style.overflow = null;
    });

    return {
      close,
      panel,
    };
  },

  computed: {
    maxWidthClass() {
      return {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
      }[this.maxWidth];
    },
  },
});
</script>
