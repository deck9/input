// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import route from "ziggy";
import { RouteParamsWithQueryOverload } from "ziggy-js";
import { Ziggy } from "@/ziggy";

export function useRoutes(): {
    route: (
        name?: string,
        params?: RouteParamsWithQueryOverload,
        absolute?: boolean
    ) => string | undefined;
} {
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
