import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "@/api/handler";
import { useForm } from "@/stores";

vi.mock("@/api/handler", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const saved = {
    uuid: "form1",
    name: "Survey",
    // stored from another page, the server refuses it if it's sent again
    privacy_link: "javascript:alert(1)",
} as FormModel;

describe("saving form settings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // real actions, not the stubs of the global testing pinia
        setActivePinia(createPinia());
        window.route = vi.fn(() => "/api/forms/form1") as unknown as typeof window.route;
        useForm().form = { ...saved };
    });

    it("sends only the page's fields and keeps what the server saved", async () => {
        // the server trims the name
        vi.mocked(handler.post).mockResolvedValue({
            data: { ...saved, name: "Feedback" },
        } as AxiosResponse);

        await useForm().updateForm({ name: " Feedback " });

        expect(handler.post).toHaveBeenCalledWith("/api/forms/form1", {
            name: " Feedback ",
        });
        expect(useForm().form?.name).toBe("Feedback");
    });

    it("keeps a newer save when an older reply comes in last", async () => {
        let answerFirst!: (reply: AxiosResponse) => void;
        vi.mocked(handler.post)
            .mockReturnValueOnce(new Promise((resolve) => (answerFirst = resolve)))
            .mockResolvedValueOnce({
                data: { ...saved, name: "Feedback", privacy_link: "https://example.com" },
            } as AxiosResponse);

        // a save on Options, then one on Privacy before the first reply
        const first = useForm().updateForm({ name: "Feedback" });
        await useForm().updateForm({ privacy_link: "https://example.com" });
        // the server saved Options first, so its reply has the old link
        answerFirst({ data: { ...saved, name: "Feedback" } } as AxiosResponse);
        await first;

        expect(useForm().form?.name).toBe("Feedback");
        expect(useForm().form?.privacy_link).toBe("https://example.com");
    });

    it.each([
        ["for no form", null],
        ["for another form", { uuid: "form2", name: "Contact" } as FormModel],
    ])("leaves the store alone when the editor left the form while it saved, %s", async (_, formAfterLeaving) => {
        let answer!: (reply: AxiosResponse) => void;
        vi.mocked(handler.post).mockReturnValueOnce(
            new Promise((resolve) => (answer = resolve)),
        );

        const save = useForm().updateForm({ name: "Feedback" });
        // the settings page was left before the reply came
        useForm().form = formAfterLeaving && { ...formAfterLeaving };
        answer({ data: { ...saved, name: "Feedback" } } as AxiosResponse);

        await expect(save).resolves.toBeUndefined();
        expect(useForm().form).toEqual(formAfterLeaving);
    });

    it("keeps the last saved values when the server refuses", async () => {
        const refusal = new AxiosError("Unprocessable", undefined, undefined, undefined, {
            status: 422,
            data: { message: "The name field is required." },
        } as AxiosResponse);
        vi.mocked(handler.post).mockRejectedValue(refusal);

        await expect(useForm().updateForm({ name: "" })).rejects.toBe(refusal);

        expect(useForm().form).toEqual(saved);
    });
});

describe("loading the questions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setActivePinia(createPinia());
        window.route = vi.fn(() => "/api/forms/form1/blocks") as unknown as typeof window.route;
        useForm().form = { ...saved };
    });

    it("drops a reply that comes in after the editor left the form", async () => {
        let answer!: (reply: AxiosResponse) => void;
        vi.mocked(handler.get).mockReturnValue(
            new Promise((resolve) => (answer = resolve)),
        );

        const loading = useForm().getBlocks();
        useForm().clearForm();
        answer({ status: 200, data: [{ id: 1, uuid: "b1" }] } as AxiosResponse);
        await loading;

        expect(useForm().blocks).toBeNull();
    });

    it("keeps another form's questions from a late reply", async () => {
        let answer!: (reply: AxiosResponse) => void;
        vi.mocked(handler.get).mockReturnValue(
            new Promise((resolve) => (answer = resolve)),
        );

        const loading = useForm().getBlocks();
        useForm().form = { ...saved, uuid: "form2" };
        answer({ status: 200, data: [{ id: 1, uuid: "b1" }] } as AxiosResponse);
        await loading;

        expect(useForm().blocks).toBeNull();
    });
});
