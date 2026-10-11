import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useNotice } from "./notice";

const httpError = (status: number, data: unknown = {}) =>
    new AxiosError("Request failed", "ERR_BAD_RESPONSE", undefined, null, {
        status,
        data,
    } as AxiosResponse);

const refused = httpError(422, {
    message: "The options.allowed files field must be an integer.",
});

describe("notice store", () => {
    beforeEach(() => setActivePinia(createPinia()));

    it("shows the server's reason for a refused save", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveInteraction:1");

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

            notice.showSaveError(
                httpError(status, { message }),
                "saveInteraction:1",
            );

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

        notice.showSaveError(error, "saveInteraction:1");

        expect(notice.message).toBe(
            "Your change was not saved. Check your connection and try again.",
        );
    });

    it("names the question by its title, else by its id", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveBlock:1", {
            title: null,
            uuid: "Ab12",
        } as FormBlockModel);

        expect(notice.message).toBe(
            'Your change to "Ab12" was not saved: The options.allowed files field must be an integer.',
        );

        notice.showSaveError(refused, "saveBlock:2", {
            title: "Your name",
            uuid: "Cd34",
        } as FormBlockModel);

        expect(notice.message).toMatch(/^Your change to "Your name" was not/);
    });

    it("clears the message when the same save works later", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveInteraction:1");
        notice.clearSaveError("saveInteraction:1");

        expect(notice.message).toBeNull();
    });

    it("keeps the message when another save works", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveInteraction:1");
        notice.clearSaveError("saveInteraction:2");

        expect(notice.message).toMatch(/^Your change was not saved/);
    });

    it("shows an older failure again when the newer one is fixed", () => {
        const notice = useNotice();
        const block = { title: "Your name" } as FormBlockModel;

        notice.showSaveError(refused, "saveBlock:1", block);
        notice.showSaveError(refused, "saveInteraction:2");
        notice.clearSaveError("saveInteraction:2");

        expect(notice.message).toMatch(/^Your change to "Your name"/);
    });
});
