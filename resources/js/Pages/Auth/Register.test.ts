import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { useForm } from "@inertiajs/vue3";
import Register from "./Register.vue";

describe("terms checkbox on the register form", () => {
    it("ticks the box when the terms label is clicked", async () => {
        const wrapper = mount(Register, {
            attachTo: document.body,
            global: {
                mocks: {
                    $inertia: { form: useForm },
                    $page: {
                        props: {
                            jetstream: {
                                hasTermsAndPrivacyPolicyFeature: true,
                            },
                        },
                    },
                    route: (name: string) => name,
                },
                stubs: { Head: true, Link: true, JetValidationErrors: true },
            },
        });

        const checkbox = wrapper.find<HTMLInputElement>("input#terms");
        const label = wrapper
            .findAll("label[for=terms]")
            .find((l) => l.text().startsWith("I agree"));

        expect(checkbox.element.checked).toBe(false);
        await label?.trigger("click");

        expect(checkbox.element.checked).toBe(true);
        expect(
            (wrapper.vm as unknown as { form: { terms: boolean } }).form.terms,
        ).toBe(true);

        wrapper.unmount();
    });
});
