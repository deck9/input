export declare function route<T extends Route>(
    name: T,
    params?: RouteParams<T> | undefined,
    absolute?: boolean,
    config?: Config
): Router;

export declare function route<T extends Route>(
    name: T,
    params?: RouteParams<T> | undefined,
    absolute?: boolean,
    config?: Config
): string;

declare global {
    interface Window {
        route: typeof route;
        iptSettings: any;
    }
}
