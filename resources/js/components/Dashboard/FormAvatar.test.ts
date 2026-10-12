import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import FormAvatar from "./FormAvatar.vue";

const initial = (name: string) =>
    mount(FormAvatar, { props: { form: { name } as FormModel } }).text();

describe("form avatar", () => {
    it("shows the uploaded image", () => {
        const wrapper = mount(FormAvatar, {
            props: {
                form: {
                    name: "Event",
                    avatar: "/images/avatar.png",
                } as FormModel,
            },
        });

        expect(wrapper.find("img").attributes("src")).toBe(
            "/images/avatar.png",
        );
        expect(wrapper.find("img").attributes("alt")).toBe("");
    });

    it("shows one whole character as the initial", () => {
        expect(initial("müller Umfrage")).toBe("M");
        expect(initial("🎉 Party RSVP")).toBe("🎉");
        expect(initial("👩‍💻 Dev survey")).toBe("👩‍💻");
        expect(initial("استطلاع رضا العملاء")).toBe("ا");
        expect(initial("ßtraße")).toBe("ß");
    });
});
