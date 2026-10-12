import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import handler from "@/api/handler";
import { useForm } from "@/stores";

vi.mock("@/api/handler", () => ({ default: { post: vi.fn() } }));

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
        vi.mocked(handler.post).mockResolvedValue({
            data: { ...saved, name: "Feedback", updated_at: "2026-10-12T10:00:00Z" },
        } as AxiosResponse);

        await useForm().updateForm({ name: "Feedback" });

        expect(handler.post).toHaveBeenCalledWith("/api/forms/form1", {
            name: "Feedback",
        });
        expect(useForm().form?.name).toBe("Feedback");
        expect(useForm().form?.updated_at).toBe("2026-10-12T10:00:00Z");
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
