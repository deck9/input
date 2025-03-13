import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "Input.co Documentation",
    description: "The open-source form builder",
    srcDir: "docs",
    head: [["link", { rel: "icon", href: "https://getinput.co/favicon.ico" }]],
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "Introduction", link: "/introduction" },
        ],

        sidebar: [
            {
                text: "Getting Started",
                items: [
                    { text: "Introduction", link: "/introduction" },
                    { text: "Quick Start", link: "/quick-start" },
                ],
            },
            {
                text: "Form Builder",
                collapsed: false,
                items: [
                    {
                        text: "Managing Forms",
                        link: "/workbench/managing-forms",
                    },
                    { text: "Workbench", link: "/workbench/workbench" },
                    { text: "Storyboard", link: "/workbench/storyboard" },
                    { text: "Form Blocks", link: "/workbench/form-blocks" },
                    {
                        text: "Conditional Logic",
                        link: "/workbench/conditional-logic",
                    },
                ],
            },
            {
                text: "Input Types",
                collapsed: true,
                items: [
                    {
                        text: "Information Block 📝",
                        link: "/input-types/no-interaction",
                    },
                    {
                        text: "Multiple Choice 🔘",
                        link: "/input-types/multiplechoice",
                    },
                    { text: "Checkboxes ✅", link: "/input-types/checkboxes" },
                    { text: "Short Text 💬", link: "/input-types/short-text" },
                    { text: "Long Text 📄", link: "/input-types/long-text" },
                    { text: "Number 🔢", link: "/input-types/number" },
                    { text: "Email 📧", link: "/input-types/email" },
                    { text: "Link 🔗", link: "/input-types/link" },
                    { text: "Phone ☎️", link: "/input-types/phone" },
                    { text: "Date 📅", link: "/input-types/date" },
                    { text: "Secret 🔒", link: "/input-types/secret" },
                    { text: "Rating ⭐", link: "/input-types/rating" },
                    { text: "Scale 📊", link: "/input-types/scale" },
                    {
                        text: "File Upload 📁",
                        link: "/input-types/file-upload",
                    },
                    { text: "Consent ✓", link: "/input-types/consent" },
                ],
            },
            {
                text: "Self-Hosting",
                collapsed: true,
                items: [
                    {
                        text: "Feature Limitations",
                        link: "/hosting/limitations",
                    },
                    { text: "Docker Compose", link: "/hosting/docker-compose" },
                    { text: "Proxy Setup / TLS", link: "/hosting/proxy-setup" },
                ],
            },
        ],

        socialLinks: [
            { icon: "github", link: "https://github.com/deck9/input" },
        ],
    },
});
