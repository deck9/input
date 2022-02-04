<template>
  <app-layout title="Form Settings">
    <div class="w-full max-w-5xl px-4 mx-auto">
      <div class="px-3 py-2 mt-6 border rounded border-grey-200 bg-grey-50">
        <h1 class="text-xl font-bold text-blue-900">{{ form.name }}</h1>
        <div class="flex space-x-3 text-sm text-grey-500">
          <div>
            <span class="font-semibold">{{ store.blocks?.length ?? 0 }}</span> blocks
          </div>
          <div>
            <span class="font-semibold">{{ form.total_sessions }}</span> sessions
          </div>
          <div v-show="form.total_sessions > 0">
            <span class="font-semibold">{{ form.completion_rate }}%</span> completions
          </div>
        </div>
      </div>

      <TabGroup :vertical="true" as="div" class="grid w-full grid-cols-12 mx-auto mt-8 gap-x-6">
        <div class="col-span-4 pt-8">
          <TabList
            as="nav"
            class="overflow-hidden bg-white border divide-y rounded border-grey-200 divide-grey-50"
            aria-label="Sidebar"
          >
            <Tab v-slot="{ selected }" as="template" v-for="item in navigation" :key="item.name">
              <button
                :class="[
                  selected
                    ? 'bg-grey-50'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  'relative block w-full text-left px-3 py-3 text-sm font-medium',
                ]"
              >
                <div v-show="selected" class="absolute inset-y-0 left-0 w-1 bg-blue-400"></div>
                <span class="truncate">{{ item.name }}</span>
              </button>
            </Tab>
          </TabList>
        </div>

        <TabPanels as="div" class="col-span-8">
          <TabPanel v-for="item in navigation" :key="item.name">
            <h3 class="pb-2 text-xl font-medium border-b border-grey-300">{{ item.name }}</h3>

            <div class="mt-6">
              <component :is="item.component"></component>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  </app-layout>
</template>

<script setup lang="ts">
import AppLayout from "@/Layouts/AppLayout.vue";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/vue";

import Options from "@/components/Factory/Settings/Options.vue";
import Privacy from "@/components/Factory/Settings/Privacy.vue";
import Theme from "@/components/Factory/Settings/Theme.vue";
import SocialAccounts from "@/components/Factory/Settings/SocialAccounts.vue";

import { useForm } from "@/stores";
import { onMounted, onUnmounted } from "vue";

const props = defineProps<{
  form: FormModel;
}>();
const store = useForm();

onMounted(async () => {
  await store.getBlocks();
})

const navigation = [
  { name: "Options", component: Options },
  { name: "Privacy", component: Privacy },
  { name: "Style", component: Theme },
  { name: "Social Accounts", component: SocialAccounts },
  { name: "Embeds", component: Theme },
];

onUnmounted(() => {
  store.clearForm();
});

store.$patch({
  form: props.form,
});
</script>
