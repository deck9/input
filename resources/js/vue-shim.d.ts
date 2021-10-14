/// <reference types="vite/client" />

declare module "*.vue" {
    import { DefineComponent } from "vue";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module 'vue3-smooth-dnd' {
    import { DefineComponent } from "vue";

    export const Container: DefineComponent<{}, {}, any>;
    export const Draggable: DefineComponent<{}, {}, any>;
}
