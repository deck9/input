<template>
  <div class="flex h-full items-center justify-center">
    <div class="prose w-full max-w-xl rounded bg-white px-6 py-8 shadow">
      <h2><D9Icon class="" name="circle-info" /> Welcome to the Editor</h2>

      <h3>Storyboard</h3>
      <p>
        On the left side, you see the Storyboard, which shows all blocks
        belonging to your form. It might be empty now, but you can start right
        away by creating your first block by
        <strong> clicking the button on the bottom left of this page </strong>.
      </p>

      <h3>Workbench</h3>
      <p>
        Next to the Storyboard, you find the Workbench. On the Workbench, you
        can configure the message and interactions of a single block. Just
        select the block you want to edit on the storyboard.
      </p>

      <h3>More Help</h3>
      <p>
        To find out more, you can visit our
        <a href="https://help.getinput.co" target="_blank">help center</a>.
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { D9Icon } from "@deck9/ui";
</script>
