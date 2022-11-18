/* eslint-disable no-async-promise-executor */
import handler from "./handler";

const CONTENT_API_DOMAIN = "https://strapi.deck9.co";

export function callChangelog(limit = 5, sortBy = "id"): Promise<any> {
    const params = new URLSearchParams();
    params.append("pagination[pageSize]", limit.toString());
    params.append("sort", sortBy);

    return new Promise(async function (resolve, reject) {
        try {
            const response = await handler.get(
                `${CONTENT_API_DOMAIN}/api/changelogs?${params.toString()}`
            );
            if (response.status === 200) {
                resolve(response.data);
            }
        } catch (error) {
            reject(error);
        }
    });
}
