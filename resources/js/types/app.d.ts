import { RouteParamsWithQueryOverload, Config, Router } from "ziggy-js";

export declare function route(
    name?: undefined,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): Router;

export declare function route(
    name: string,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): string;

declare global {
    interface Window {
        route: typeof route
    }
}
