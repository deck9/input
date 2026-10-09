# INPUT Documentation

This folder contains the documentation for INPUT, built using [VitePress](https://vitepress.dev/).

## Getting Started with the Documentation

### Prerequisites

-   Node.js 18 (see `mise.toml`)
-   npm

### Installation

If you haven't already installed the dependencies, run:

```bash
# From the root project directory
npm ci
```

VitePress is part of the dev dependencies, so there is nothing else to install.

### Running the Documentation Locally

To start the documentation dev server:

```bash
# From the root project directory
npm run docs:dev
```

This will start a local server, typically at `http://localhost:5173`. The documentation will automatically reload as you make changes to the markdown files.

### Building for Production

To build the documentation for production:

```bash
# From the root project directory
npm run docs:build
```

This will generate static files in the `.vitepress/dist` directory in the project root.

To preview the production build locally:

```bash
# From the root project directory
npm run docs:preview
```

## Documentation Structure

-   `.vitepress/` (in the project root): VitePress configuration
-   `docs/`: Root directory for all documentation
    -   `public/`: Files served as they are, like the favicon
    -   `input-types/`: Documentation for each input type
    -   `workbench/`: Documentation for the form builder interface
    -   `hosting/`: Self-hosting documentation

## Writing Documentation

-   All documentation is written in Markdown
-   Each input type has its own file in the `input-types/` directory
-   Pages are automatically included in the navigation based on the configuration in `.vitepress/config.mts`

## Adding New Pages

To add a new page:

1. Create a new Markdown file in the appropriate directory
2. Add an entry to the sidebar in `.vitepress/config.mts`

## Customizing the Theme

The docs use the default VitePress theme. To customize it, add a `.vitepress/theme/` directory in the project root. See the [VitePress documentation](https://vitepress.dev/guide/extending-default-theme) for more details.

## Deploying the Documentation

There is no automatic deployment yet. Build the documentation and deploy the contents of the `.vitepress/dist` directory to a static hosting service.
