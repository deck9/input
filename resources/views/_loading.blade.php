<style>
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
    }

    .absolute {
        position: absolute;
    }

    .inset-x-0 {
        left: 0px;
        right: 0px;
    }

    .top-0 {
        top: 0px;
    }

    .mx-auto {
        margin-left: auto;
        margin-right: auto;
    }

    .flex {
        display: flex;
    }

    .h-12 {
        height: 3rem;
    }

    .min-h-screen {
        min-height: 100vh;
    }

    .w-full {
        width: 100%;
    }

    .max-w-screen-lg {
        max-width: 1024px;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }

    .items-center {
        align-items: center;
    }

    .justify-center {
        justify-content: center;
    }

    .bg-orange-600 {
        --tw-bg-opacity: 1;
        background-color: rgb(234 88 12 / var(--tw-bg-opacity));
    }

    .py-2 {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
    }

    .px-4 {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .text-sm {
        font-size: 0.875rem;
        line-height: 1.25rem;
    }

    .font-bold {
        font-weight: 700;
    }

    .text-orange-50 {
        --tw-text-opacity: 1;
        color: rgb(255 247 237 / var(--tw-text-opacity));
    }
</style>

<div class="min-h-screen flex items-center justify-center">
    <svg class="h-12 text-grey-800 animate-spin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M260.002 50.038 260 .032 256 0c141.385 0 256 114.615 256 256 0 69.254-27.5 132.085-72.174 178.169l-35.36-35.361C440.094 361.776 462 311.446 462 256c0-112.434-90.075-203.83-201.998-205.962Z"
              fill="#000" fill-rule="evenodd" />
    </svg>
    <span class="sr-only">The form is loading</span>
</div>
