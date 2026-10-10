import { AxiosError } from "axios";

// a refused template (422) says why, anything else gets a plain message
export function templateImportError(error: unknown): string {
    return error instanceof AxiosError && error.response?.status === 422
        ? error.response.data.message
        : "This file could not be imported as a template.";
}
