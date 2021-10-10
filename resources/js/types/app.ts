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

export interface FormModel {
    id: number,
    name: string
    uuid: string
    total_sessions: number
    completion_rate: number
    is_published: boolean
    initials: string
    contrast_color: string
    avatar: string
    brand_color: string
}
