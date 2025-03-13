# INPUT Documentation

This folder contains the documentation for INPUT, built using [VitePress](https://vitepress.dev/).

## Getting Started with the Documentation

### Prerequisites

-   Node.js 16 or higher
-   npm or yarn

### Installation

If you haven't already installed the dependencies, run:

```bash
# From the root project directory
npm install
```

If VitePress is not yet installed (you'll see an error message about vitepress command not found), install it with:

```bash
npm install -D vitepress@1.0.0-rc.42
```

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

This will generate static files in the `docs/.vitepress/dist` directory.

To preview the production build locally:

```bash
# From the root project directory
npm run docs:preview
```

## Documentation Structure

-   `docs/`: Root directory for all documentation
    -   `.vitepress/`: VitePress configuration
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

To customize the VitePress theme, edit the files in the `.vitepress/theme/` directory. See the [VitePress documentation](https://vitepress.dev/guide/extending-default-theme) for more details.

## Deploying the Documentation

The documentation is automatically built and deployed when changes are pushed to the main branch. For manual deployment, build the documentation and deploy the contents of the `docs/.vitepress/dist` directory to a static hosting service.
