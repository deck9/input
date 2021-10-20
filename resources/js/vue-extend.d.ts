export declare module "@vue/runtime-core" {
    export default interface ComponentCustomProperties {
        route: typeof route
        $inertia: InertiaApp
        $page: any
    }

    function withAsyncContext(getAwaitable: () => any): any
}
