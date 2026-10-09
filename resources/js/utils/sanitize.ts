import DOMPurify from "dompurify";

// what the form editor (tiptap) writes, plus b and i for hand-written consent texts
const ALLOWED_TAGS = [
    "a",
    "b",
    "blockquote",
    "br",
    "code",
    "em",
    "h2",
    "h3",
    "hr",
    "i",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "s",
    "span",
    "strong",
    "u",
    "ul",
];
const ALLOWED_ATTR = [
    "alt",
    "href",
    "rel",
    "src",
    "start",
    "style",
    "target",
    "title",
    "type",
];

export function sanitizeHtml(html?: string | null): string {
    return DOMPurify.sanitize(html ?? "", { ALLOWED_TAGS, ALLOWED_ATTR });
}

export function isAllowedLink(
    url?: string | null,
    protocols = ["http:", "https:", "mailto:"],
): url is string {
    if (!url) {
        return false;
    }

    try {
        return protocols.includes(new URL(url).protocol);
    } catch {
        return false;
    }
}
