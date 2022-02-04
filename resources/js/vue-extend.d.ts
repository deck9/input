declare module "@vue/runtime-core" {
    export interface GlobalComponents {
        RouterLink: typeof import("vue-router")["RouterLink"];
        RouterView: typeof import("vue-router")["RouterView"];
    }

    export default interface ComponentCustomProperties {
        route: typeof route;
        $inertia: InertiaApp;
        $page: any;
    }

    function withAsyncContext(getAwaitable: () => any): any;
}

export {};
