import { describe, expect, it } from "vitest";
import { getTextFromHtml } from "./index";

describe("getTextFromHtml", () => {
    it.each([
        ["Hello", "Hello"],
        ["<p>Hello <strong>world</strong></p>", "Hello world"],
    ])("returns the text of %s", (html, text) => {
        expect(getTextFromHtml(html)).toBe(text);
    });

    it("does not run event handlers in the html", async () => {
        document.title = "";

        getTextFromHtml(
            "<details open ontoggle=\"document.title = 'ran'\"></details>",
        );
        // jsdom fires the toggle event in a timeout
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(document.title).toBe("");
    });
});
