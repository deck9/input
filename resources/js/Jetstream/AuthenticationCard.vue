<template>
  <div
    class="
      min-h-screen
      flex flex-col
      sm:justify-center
      items-center
      pt-6
      sm:pt-0
      bg-grey-200
    "
  >
    <div>
      <slot name="logo" />
    </div>

    <div
      class="
        w-full
        sm:max-w-md
        mt-6
        px-6
        pt-8
        pb-6
        bg-white
        overflow-hidden
        sm:rounded-lg
      "
    >
      <slot />
    </div>
  </div>
</template>
