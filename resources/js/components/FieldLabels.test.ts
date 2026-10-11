import { describe, expect, it } from "vitest";
import { parse } from "vue/compiler-sfc";

type Node = {
    type: number;
    tag?: string;
    props?: Array<{
        name: string;
        value?: { content: string };
        arg?: { content: string };
        exp?: { content: string };
    }>;
    children?: Node[];
};

// labels that head a group of controls or show a value, not a single field
const groupLabels = [
    "Factory/FactoryFormDropdown.vue: Visibility",
    "Factory/Main/ConfigureFile.vue: Allowed File Types",
    "Factory/Settings/TemplateExport.vue: Template Files",
    "Factory/Settings/partials/ImageUpload.vue: (bound)",
    "Factory/Sidebar/BlockLogicRule.vue: Action",
    "Factory/Sidebar/BlockLogicRule.vue: Conditions",
    "Factory/Sidebar/BlockLogicRule.vue: Rule Execution",
    "Pages/Teams/Create.vue: Team Owner",
];

const sources = import.meta.glob("/resources/js/**/*.vue", {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>;

const elements = (node: Node): Node[] =>
    (node.children ?? []).flatMap((child) =>
        child.type === 1 ? [child, ...elements(child)] : [],
    );

// "x" for id="x", ":<expression>" for :id="<expression>"
const idOf = (node: Node) => {
    for (const prop of node.props ?? []) {
        if (prop.name === "id" && prop.value) return prop.value.content;
        if (prop.name === "bind" && prop.arg?.content === "id") {
            return `:${prop.exp?.content}`;
        }
    }
};

const labelOf = (node: Node) =>
    node.props?.find((prop) => prop.name === "label")?.value?.content ??
    "(bound)";

const labels = Object.entries(sources).flatMap(([path, source]) => {
    const template = parse(source).descriptor.template?.ast as Node | undefined;
    const all = template ? elements(template) : [];
    const file = path.replace(/^\/resources\/js\/(components\/)?/, "");

    return all
        .filter((node) => node.tag === "D9Label" || node.tag === "d9-label")
        .map((node) => {
            const id = idOf(node);
            return {
                name: `${file}: ${labelOf(node)}`,
                id,
                tied: !!id && all.some((n) => n !== node && idOf(n) === id),
            };
        });
});

describe("field labels", () => {
    it("tie every label to its field by id, except group labels", () => {
        const untied = labels
            .filter((label) => !label.tied)
            .map((label) => label.name);

        expect(untied.sort()).toEqual(groupLabels);
    });

    // components share a page, a page is alone; a repeating component binds useId()
    it("use each fixed id in one component only", () => {
        const files = new Map<string, Set<string>>();
        const fixed = labels.filter(
            (l) => l.id && !l.id.startsWith(":") && !l.name.startsWith("Pages/"),
        );

        for (const label of fixed) {
            const file = label.name.split(": ")[0];
            files.set(label.id!, (files.get(label.id!) ?? new Set()).add(file));
        }

        const shared = [...files].filter(([, inFiles]) => inFiles.size > 1);

        expect(shared).toEqual([]);
    });
});
