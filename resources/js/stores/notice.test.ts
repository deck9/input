import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useForm } from "./form";
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
            "Your change wasn't saved: The options.allowed files field must be an integer.",
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
                "Your change wasn't saved: your session has expired. Reload the page and try again.",
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
            "Your change wasn't saved. Check your connection and try again.",
        );
    });

    it("names the question by its number and text", () => {
        const notice = useNotice();
        useForm().blocks = [
            { id: 1, uuid: "b1", type: "input-short", message: "<p>Name</p>" },
            { id: 2, uuid: "g1", type: "group", title: "Travel" },
            {
                id: 3,
                uuid: "b3",
                type: "radio",
                message: "<p>Will you come to the <b>meetup</b>?</p>",
                parent_block: "g1",
            },
            { id: 4, uuid: "b4", type: "input-short", message: null },
        ] as FormBlockModel[];
        const [, group, question, untitled] = useForm().blocks!;

        notice.showSaveError(refused, "saveBlock:3", question);
        expect(notice.message).toBe(
            "Your change to question 2 (“Will you come to the…”) wasn't saved: The options.allowed files field must be an integer.",
        );

        notice.showSaveError(refused, "saveBlock:4", untitled);
        expect(notice.message).toMatch(/^Your change to question 3 wasn't/);

        notice.showSaveError(refused, "saveBlock:2", group);
        expect(notice.message).toMatch(/^Your change to group “Travel” wasn't/);
    });

    it("names a question that isn't in the list by its text", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveBlock:9", {
            id: 9,
            type: "input-short",
            message: "<p>Your name</p>",
        } as FormBlockModel);

        expect(notice.message).toMatch(/^Your change to “Your name” wasn't/);
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

        expect(notice.message).toMatch(/^Your change wasn't saved/);
    });

    it("shows the hidden bar again for a new failure", () => {
        const notice = useNotice();

        notice.showSaveError(refused, "saveInteraction:1");
        notice.isBarHidden = true;
        notice.showSaveError(refused, "saveInteraction:2");

        expect(notice.isBarHidden).toBe(false);
    });

    it("shows an older failure again when the newer one is fixed", () => {
        const notice = useNotice();
        const block = { message: "Your name" } as FormBlockModel;

        notice.showSaveError(refused, "saveBlock:1", block);
        notice.showSaveError(refused, "saveInteraction:2");
        notice.clearSaveError("saveInteraction:2");

        expect(notice.message).toMatch(/^Your change to “Your name”/);
    });

    it("says Saving… while a save waits or runs, and nothing once it worked", async () => {
        const notice = useNotice();
        let done!: () => void;

        notice.waitForSave("saveBlock:1");
        expect(notice.saveStatus).toBe("saving");

        const save = notice.send(
            "saveBlock:1",
            () => new Promise<void>((resolve) => (done = resolve)),
        );
        expect(notice.saveStatus).toBe("saving");

        done();
        await save;
        expect(notice.saveStatus).toBe("idle");
    });

    it("keeps Saving… while the next change waits behind a running save", async () => {
        const notice = useNotice();
        let done!: () => void;

        const save = notice.send(
            "saveBlock:1",
            () => new Promise<void>((resolve) => (done = resolve)),
        );
        notice.waitForSave("saveBlock:1");
        done();
        await save;

        expect(notice.saveStatus).toBe("saving");
    });

    it("says a save failed, and Retry sends it again", async () => {
        const notice = useNotice();
        const request = vi
            .fn()
            .mockRejectedValueOnce(refused)
            .mockResolvedValueOnce("ok");

        await notice.send("saveBlock:1", request);
        expect(notice.saveStatus).toBe("failed");
        expect(notice.canRetry).toBe(true);

        notice.retrySaves();
        expect(notice.canRetry).toBe(false);
        await vi.waitFor(() => expect(notice.saveStatus).toBe("idle"));

        expect(request).toHaveBeenCalledTimes(2);
        expect(notice.message).toBeNull();
    });
});
