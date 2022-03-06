<template>
  <div>
    <form @submit.prevent="saveOptions">
      <div class="mb-4">
        <D9Label label="Instagram" />
        <D9Input type="text" v-model="instagram" block />
      </div>

      <div class="mb-4">
        <D9Label label="Github" />
        <D9Input type="text" v-model="github" block />
      </div>

      <div class="mb-4">
        <D9Label label="Twitter" />
        <D9Input type="text" v-model="twitter" block />
      </div>

      <div class="mb-4">
        <D9Label label="LinkedIn" />
        <D9Input type="text" v-model="linkedin" block />
      </div>

      <div class="mb-4">
        <D9Label label="Facebook" />
        <D9Input type="text" v-model="facebook" block />
      </div>

      <D9Button
        type="submit"
        label="Save Social Accounts"
        :is-loading="isSaving"
      />
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "@/stores";
import { D9Button, D9Label, D9Input } from "@deck9/ui";
import { ref } from "vue";

const store = useForm();
const isSaving = ref(false);

const instagram = ref(store?.form?.instagram);
const github = ref(store?.form?.github);
const linkedin = ref(store?.form?.linkedin);
const facebook = ref(store?.form?.facebook);
const twitter = ref(store?.form?.twitter);

const saveOptions = async () => {
  isSaving.value = true;

  await store.updateForm({
    instagram: instagram.value,
    github: github.value,
    linkedin: linkedin.value,
    facebook: facebook.value,
    twitter: twitter.value,
  });

  isSaving.value = false;
};
</script>
