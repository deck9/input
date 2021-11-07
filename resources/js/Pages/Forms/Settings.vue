<template>
  <app-layout title="Form Settings">
    <TabGroup
      :vertical="true"
      as="div"
      class="w-full max-w-5xl mx-auto grid grid-cols-12 gap-x-6 py-6"
    >
      <div class="col-span-4">
        <TabList
          as="nav"
          class="
            bg-white
            rounded
            border border-grey-200
            overflow-hidden
            divide-y divide-grey-50
          "
          aria-label="Sidebar"
        >
          <Tab
            v-slot="{ selected }"
            as="template"
            v-for="item in navigation"
            :key="item.name"
          >
            <button
              :class="[
                selected
                  ? 'bg-grey-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                'relative block w-full text-left px-3 py-3 text-sm font-medium',
              ]"
            >
              <div
                v-show="selected"
                class="absolute left-0 inset-y-0 w-1 bg-blue-400"
              ></div>
              <span class="truncate">{{ item.name }}</span>
            </button>
          </Tab>
        </TabList>
      </div>

      <TabPanels as="div" class="col-span-8">
        <TabPanel v-for="item in navigation" :key="item.name">
          <h3 class="text-xl font-medium border-b border-grey-300 pb-2">
            {{ item.name }}
          </h3>

          <div class="mt-6">
            <component :is="item.component"></component>
          </div>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

import Options from "@/components/Factory/Settings/Options.vue";
import Theme from "@/components/Factory/Settings/Theme.vue";

import { useForm } from "@/stores";
import { onUnmounted } from "vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

const navigation = [
  { name: "Options", component: Options },
  { name: "Privacy", component: Theme },
  { name: "Style", component: Theme },
  { name: "Social Accounts", component: Options },
  { name: "Embeds", component: Theme },
];

onUnmounted(() => {
  store.clearForm();
});

store.$patch({
  form: props.form,
});
</script>
