<template>
  <div
    class="dark flex min-h-screen flex-col items-center bg-grey-900 pt-6 sm:justify-center sm:pt-0"
  >
    <div class="w-full overflow-hidden px-6 pt-8 pb-6 sm:max-w-md">
      <slot />
    </div>
    <div class="mt-8">
      <slot name="logo" />
    </div>
  </div>
</template>
