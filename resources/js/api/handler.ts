import axios from "axios";
import csrfToken from "./interceptors/csrfToken";

const handler = axios.create({
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
    },
});

handler.interceptors.request.use(csrfToken);

export default handler;
