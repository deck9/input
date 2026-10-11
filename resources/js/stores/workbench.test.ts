import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNotice } from "./notice";
import { useWorkbench } from "./workbench";
import { callUpdateFormBlockInteraction } from "@/api/interactions";

vi.mock("@/api/interactions", () => ({
    callUpdateFormBlockInteraction: vi.fn(),
}));

const interaction = { id: 1, type: "file" } as FormBlockInteractionModel;

describe("workbench store", () => {
    beforeEach(() => setActivePinia(createPinia()));

    it("shows the server's reason when a save is refused", async () => {
        vi.mocked(callUpdateFormBlockInteraction).mockRejectedValue(
            new AxiosError(
                "Request failed",
                "ERR_BAD_REQUEST",
                undefined,
                null,
                {
                    status: 422,
                    data: {
                        message:
                            "The options.allowed files field must be an integer.",
                    },
                } as AxiosResponse,
            ),
        );

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBe(
            "Your change was not saved: The options.allowed files field must be an integer.",
        );
    });

    it("shows a message when the request fails", async () => {
        vi.mocked(callUpdateFormBlockInteraction).mockRejectedValue(
            new AxiosError("Network Error", "ERR_NETWORK"),
        );

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBe(
            "Your change was not saved. Check your connection and try again.",
        );
    });

    it("shows no message when the save works", async () => {
        vi.mocked(callUpdateFormBlockInteraction).mockResolvedValue({
            status: 200,
            data: interaction,
        } as AxiosResponse);

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBeNull();
    });
});
