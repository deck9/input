import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useNotice } from "./notice";

const httpError = (status: number, data: unknown = {}) =>
    new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, null, {
        status,
        data,
    } as AxiosResponse);

describe("notice store", () => {
    beforeEach(() => setActivePinia(createPinia()));

    it("shows the server's reason for a refused save", () => {
        const notice = useNotice();

        notice.showSaveError(
            httpError(422, {
                message: "The options.allowed files field must be an integer.",
            }),
        );

        expect(notice.message).toBe(
            "Your change was not saved: The options.allowed files field must be an integer.",
        );
    });

    it.each([
        [419, "CSRF token mismatch."],
        [401, "Unauthenticated."],
    ])(
        "asks to reload when the session has expired (%i)",
        (status, message) => {
            const notice = useNotice();

            notice.showSaveError(httpError(status, { message }));

            expect(notice.message).toBe(
                "Your change was not saved: your session has expired. Reload the page and try again.",
            );
        },
    );

    it.each([
        ["a network error", new AxiosError("Network Error", "ERR_NETWORK")],
        ["a server error", httpError(500, { message: "Server Error" })],
    ])("shows a general message for %s", (_, error) => {
        const notice = useNotice();

        notice.showSaveError(error);

        expect(notice.message).toBe(
            "Your change was not saved. Check your connection and try again.",
        );
    });
});
