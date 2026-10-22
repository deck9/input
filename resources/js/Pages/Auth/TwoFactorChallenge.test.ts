import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router, useForm } from "@inertiajs/vue3";
import TwoFactorChallenge from "./TwoFactorChallenge.vue";

const mountChallenge = () =>
    mount(TwoFactorChallenge, {
        attachTo: document.body,
        global: {
            mocks: { $inertia: { form: useForm }, route: (name: string) => name },
            stubs: { Head: true, Link: true, JetValidationErrors: true },
        },
    });

describe("log in button on the two-factor challenge", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(router, "post").mockImplementation(() => {});
    });

    it("sends the code when clicked", async () => {
        const wrapper = mountChallenge();

        await wrapper.find("input").setValue("123456");
        await wrapper.find("button[type=submit]").trigger("click");

        expect(router.post).toHaveBeenCalledOnce();
        expect(vi.mocked(router.post).mock.calls[0][1]).toMatchObject({
            code: "123456",
        });
    });

    it("sends the recovery code when clicked", async () => {
        const wrapper = mountChallenge();

        await wrapper.find("button[type=button]").trigger("click");
        await wrapper.find("input").setValue("abc-def");
        await wrapper.find("button[type=submit]").trigger("click");

        expect(router.post).toHaveBeenCalledOnce();
        expect(vi.mocked(router.post).mock.calls[0][1]).toMatchObject({
            recovery_code: "abc-def",
        });
    });
});
