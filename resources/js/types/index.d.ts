import { InertiaApp } from "@inertiajs/inertia-vue3";
import { RouteParamsWithQueryOverload, Config, Router } from "ziggy-js";

declare function route(
    name?: undefined,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): Router;

declare function route(
    name: string,
    params?: RouteParamsWithQueryOverload,
    absolute?: boolean,
    config?: Config,
): string;

interface FormModel {
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
