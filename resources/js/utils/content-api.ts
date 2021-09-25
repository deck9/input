import GhostContentAPI, { GhostContentAPIOptions } from "@tryghost/content-api";

const config: GhostContentAPIOptions = {
    url: 'https://cms.deck9.co',
    key: "28eac4288a59448c9501ad6da4",
    version: "canary"
};

const api = new GhostContentAPI(config);

export default api;
