export function useRouteParams(
    blacklist: string[] = []
): Record<string, string> {
    const params = {};

    new URLSearchParams(window.location.search).forEach((value, key) => {
        if (blacklist.includes(key)) {
            return;
        }

        params[key] = value;
    });

    return params;
}
