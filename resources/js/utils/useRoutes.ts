// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import route from "ziggy";
import { RouteParamsWithQueryOverload } from "ziggy-js";

export async function useRoutes(): Promise<{
    route: (
        name?: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ) => string | undefined;
}> {
    const response = await fetch("/api/routes");
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
