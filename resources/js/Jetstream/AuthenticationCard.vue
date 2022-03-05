<template>
  <div
    class="flex min-h-screen flex-col items-center bg-grey-100 pt-6 sm:justify-center sm:pt-0"
  >
    <div
      class="mt-6 w-full overflow-hidden bg-white px-6 pt-8 pb-6 shadow-md sm:max-w-md sm:rounded-lg"
    >
      <div class="mb-12">
        <slot name="logo" />
      </div>
      <slot />
    </div>
  </div>
</template>
