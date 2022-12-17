import route, { RouteParamsWithQueryOverload } from "ziggy-js";

export async function useRoutes(): Promise<{
    route: (
        name?: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ) => string | undefined;
}> {
    const response = await fetch(
        import.meta.env.VITE_APP_URL
            ? import.meta.env.VITE_APP_URL + "/api/routes"
            : "/api/routes"
    );
    const Ziggy = await response.json();

    const routeWrapper = (
        name?: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ): string | undefined => {
        if (name) {
            return route(name, params, absolute, Ziggy);
        }

        return undefined;
    };

    return { route: routeWrapper };
}
