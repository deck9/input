<template>
  <div class="flex justify-between md:col-span-1">
    <div class="px-4 sm:px-0">
      <h3 class="text-lg font-medium text-grey-900">
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
