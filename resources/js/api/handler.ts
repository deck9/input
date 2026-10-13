import axios, { AxiosRequestConfig } from "axios";
import csrfToken from "./interceptors/csrfToken";

const handler = axios.create({
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
});

handler.interceptors.request.use(csrfToken);

// A save sent while the page closes: fetch with keepalive outlives the page,
// an XHR can be dropped (mobile Safari). Keepalive allows at most 64 KB.
export const keepAlive = (data: object): AxiosRequestConfig | undefined =>
    new TextEncoder().encode(JSON.stringify(data)).length < 60_000
        ? { adapter: "fetch", fetchOptions: { keepalive: true } }
        : undefined;

export default handler;
