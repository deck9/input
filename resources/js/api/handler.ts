import axios from "axios"
import csrfToken from "./interceptors/csrfToken"

const handler = axios.create({
    withCredentials: true,
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    }
})

handler.interceptors.request.use(csrfToken);

export default handler
