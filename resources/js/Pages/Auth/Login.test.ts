import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { router, useForm } from "@inertiajs/vue3";
import Login from "./Login.vue";

const submitLogin = async (remember: boolean) => {
    const wrapper = mount(Login, {
        global: {
            mocks: { $inertia: { form: useForm }, route: (name: string) => name },
            stubs: { Head: true, Link: true, JetValidationErrors: true },
        },
    });

    await wrapper.find("input[type=checkbox]").setValue(remember);
    await wrapper.find("form").trigger("submit");

    return vi.mocked(router.post).mock.calls[0][1];
};

describe("remember me on the login form", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(router, "post").mockImplementation(() => {});
    });

    it("asks to remember the login when ticked", async () => {
        expect(await submitLogin(true)).toMatchObject({ remember: "on" });
    });

    it("does not ask to remember the login when unticked", async () => {
        expect(await submitLogin(false)).toMatchObject({ remember: "" });
    });
});
