import { route, RouteName, RouteParams } from "ziggy-js";

// Cache Ziggy routes
let Ziggy: any = null;

// Get server URL from script tag if available
const serverUrl =
    document.currentScript?.getAttribute("data-server-url") ?? undefined;

// Construct fetch URL, if no server URL is available, use default
const fetchRoutesUrl = serverUrl ? serverUrl + "/api/routes" : "/api/routes";

export async function useRoutes(): Promise<{
    route: <T extends RouteName>(
        name: T,
        params?: RouteParams<T> | undefined,
        absolute?: boolean,
    ) => string | undefined;
}> {
    if (!Ziggy) {
        const response = await fetch(fetchRoutesUrl);
        Ziggy = await response.json();
    }

    const routeWrapper = <T extends RouteName>(
        name: T,
        params?: RouteParams<T> | undefined,
        absolute?: boolean,
    ): string | undefined => {
        if (name) {
            return route(name, params, absolute, Ziggy);
        }

        return undefined;
    };

    return { route: routeWrapper };
}
