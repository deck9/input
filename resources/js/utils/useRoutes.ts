import route, { RouteName, RouteParams } from "ziggy-js";

export async function useRoutes(): Promise<{
    route: <T extends RouteName>(
        name: T,
        params?: RouteParams<T> | undefined,
        absolute?: boolean
    ) => string | undefined;
}> {
    const response = await fetch(
        import.meta.env.VITE_APP_URL
            ? import.meta.env.VITE_APP_URL + "/api/routes"
            : "/api/routes"
    );
    const Ziggy = await response.json();

    const routeWrapper = <T extends RouteName>(
        name: T,
        params?: RouteParams<T> | undefined,
        absolute?: boolean
    ): string | undefined => {
        if (name) {
            return route(name, params, absolute, Ziggy);
        }

        return undefined;
    };

    return { route: routeWrapper };
}
