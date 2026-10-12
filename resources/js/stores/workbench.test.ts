import { AxiosError, AxiosResponse } from "axios";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "vue";
import { useForm } from "./form";
import { useNotice } from "./notice";
import { useWorkbench } from "./workbench";
import { PiniaDebounce } from "@pinia/plugin-debounce";
import debounce from "lodash/debounce";
import { callUpdateFormBlock } from "@/api/blocks";
import { callUpdateFormBlockInteraction } from "@/api/interactions";

vi.mock("@/api/interactions", () => ({
    callUpdateFormBlockInteraction: vi.fn(),
}));

vi.mock("@/api/blocks", async (importOriginal) => ({
    ...(await importOriginal()),
    callUpdateFormBlock: vi.fn(),
}));

const interaction = {
    id: 1,
    type: "file",
    form_block_id: 3,
} as FormBlockInteractionModel;
const otherInteraction = { ...interaction, id: 2 };

const refuse = () =>
    vi.mocked(callUpdateFormBlockInteraction).mockRejectedValueOnce(
        new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, null, {
            status: 422,
            data: {
                message: "The options.allowed files field must be an integer.",
            },
        } as AxiosResponse),
    );

const accept = () =>
    vi.mocked(callUpdateFormBlockInteraction).mockResolvedValueOnce({
        status: 200,
        data: interaction,
    } as AxiosResponse);

describe("workbench store", () => {
    beforeEach(() => setActivePinia(createPinia()));

    it("shows the server's reason and the question when a save is refused", async () => {
        useForm().blocks = [
            {
                id: 3,
                uuid: "Ab12",
                type: "file",
                message: "<p>Your files</p>",
            } as FormBlockModel,
        ];
        refuse();

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBe(
            "Your change to question 1 (“Your files”) wasn't saved: The options.allowed files field must be an integer.",
        );
    });

    it("shows a message when the request fails", async () => {
        vi.mocked(callUpdateFormBlockInteraction).mockRejectedValueOnce(
            new AxiosError("Network Error", "ERR_NETWORK"),
        );

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBe(
            "Your change wasn't saved. Check your connection and try again.",
        );
    });

    it("shows no message when the save works", async () => {
        accept();

        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBeNull();
    });

    it("clears the message when the same answer saves later", async () => {
        refuse();
        await useWorkbench().saveInteraction(interaction);

        accept();
        await useWorkbench().saveInteraction(interaction);

        expect(useNotice().message).toBeNull();
    });

    it("keeps the message when another answer saves", async () => {
        refuse();
        await useWorkbench().saveInteraction(interaction);

        accept();
        await useWorkbench().saveInteraction(otherInteraction);

        expect(useNotice().message).toMatch(/^Your change wasn't saved:/);
    });
});

describe("leaving the page", () => {
    const keepalive = { adapter: "fetch", fetchOptions: { keepalive: true } };

    const typeInBlock = (message: string) => {
        const workbench = useWorkbench();
        workbench.block = { id: 3, message: "<p>Hi</p>" } as FormBlockModel;
        workbench.updateBlock({ message });

        return workbench;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // the debounce the app uses, so a save waits like in the editor
        // (plugins run only once pinia is in an app)
        const pinia = createPinia();
        pinia.use(PiniaDebounce(debounce));
        createApp({}).use(pinia);
        setActivePinia(pinia);
        vi.mocked(callUpdateFormBlock).mockResolvedValue({} as AxiosResponse);
    });

    it("sends a waiting save with fetch keepalive, which outlives the page", () => {
        const workbench = typeInBlock("<p>Hi there</p>");
        expect(callUpdateFormBlock).not.toHaveBeenCalled();

        workbench.flushSaves();

        expect(callUpdateFormBlock).toHaveBeenCalledWith(
            expect.objectContaining({ message: "<p>Hi there</p>" }),
            keepalive,
        );
    });

    it("sends a save over keepalive's 64 KB limit the usual way", () => {
        typeInBlock(`<p>${"a".repeat(70_000)}</p>`).flushSaves();

        expect(callUpdateFormBlock).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
        );
    });

    it("sends saves without keepalive while the page stays", () => {
        vi.useFakeTimers();
        typeInBlock("<p>Hi there</p>");
        vi.advanceTimersByTime(1000);
        vi.useRealTimers();

        expect(callUpdateFormBlock).toHaveBeenCalledWith(
            expect.anything(),
            undefined,
        );
    });
});
