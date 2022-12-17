<template>
  <Popover class="relative" v-slot="{ open }">
    <PopoverButton
      class="flex h-full items-center gap-x-8 rounded bg-grey-700 px-4 py-1 text-grey-100 ring-offset-2 ring-offset-grey-800 focus:outline-none focus:ring-2 focus:ring-grey-600"
    >
      <div class="text-left">
        <div class="w-screen max-w-[80px] truncate font-bold md:max-w-[150px]">
          {{ store.form?.name ?? "-" }}
        </div>

        <Label :color="store.form?.is_published ? 'green' : 'yellow'">
          <D9Icon name="globe" />
          {{ store.form?.is_published ? "Published" : "Draft" }}
        </Label>
      </div>
      <div>
        <D9Icon :name="open ? 'chevron-up' : 'chevron-down'" />
      </div>
    </PopoverButton>
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="-translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <PopoverPanel
        class="absolute left-0 z-10 mt-3 w-screen max-w-xs px-4 sm:px-0"
      >
        <div
          class="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
        >
          <div class="relative bg-white p-4 text-left">
            <FormSummary v-if="store.form" :form="store.form" />
            <div class="mt-4">
              <D9Label class="mb-1" label="Share URL" />
              <div class="relative">
                <D9Input block :modelValue="store.formUrl" readonly disabled />
                <span class="absolute inset-y-0 right-2 flex items-center">
                  <D9Button
                    v-if="isSupported"
                    label="Copy"
                    icon="clipboard"
                    size="small"
                    color="dark"
                    @click="copyFormUrl"
                  />
                </span>
              </div>
            </div>
            <div class="mt-4">
              <div>
                <D9Label class="mb-1" label="Visibility" />
              </div>
              <D9Button
                icon="globe"
                :label="store.form?.is_published ? 'Unpublish' : 'Publish'"
                color="primary"
                :is-loading="isPublishing"
                @click="togglePublish"
              />
            </div>
          </div>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { ref } from "vue";
import { D9Icon, D9Input, D9Button, D9Label } from "@deck9/ui";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/vue";
import FormSummary from "@/components/Factory/FormSummary.vue";
import Label from "@/components/Label.vue";
import { useClipboard } from "@vueuse/core";

const store = useForm();

const isPublishing = ref(false);

const { copy, isSupported } = useClipboard();

const copyFormUrl = () => {
  console.log("copy form url", store.formUrl);
  copy(store.formUrl);
};

const togglePublish = async () => {
  isPublishing.value = true;

  if (store.form?.is_published) {
    if (
      window.confirm(
        "Are you sure you want to unpublish this form? People will no longer be able to submit to it."
      )
    ) {
      await store.unpublishForm();
    }
  } else {
    if (window.confirm("Do you want to publish this form?")) {
      await store.publishForm();
    }
  }

  isPublishing.value = false;
};
</script>
