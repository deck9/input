<template>
  <div class="flex justify-between md:col-span-1">
    <div class="px-4 sm:px-0">
      <!-- tabindex: a page can move the focus here, Tab skips it -->
      <h3 class="text-lg font-medium text-grey-900" tabindex="-1">
        <slot name="title"></slot>
      </h3>

      <p class="mt-1 text-sm text-grey-600">
        <slot name="description"></slot>
      </p>
    </div>

    <div class="px-4 sm:px-0">
      <slot name="aside"></slot>
    </div>
  </div>
</template>
