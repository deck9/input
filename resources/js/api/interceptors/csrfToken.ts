import axios, { AxiosRequestConfig } from "axios"

let lastUse: number = 0
const sessionLifetimeInSeconds = 120

export default async (config: AxiosRequestConfig<any>) => {
    const now = Date.now()

    // get diff in seconds
    const diff = Math.round((now - lastUse) / 1000)

    // define max session lifetime in seconds
    const sessionLifetime = sessionLifetimeInSeconds * 60 - 60

    if (lastUse && diff >= sessionLifetime) {
        await axios.get('/sanctum/csrf-cookie')
    }

    lastUse = now

    return config;
}
