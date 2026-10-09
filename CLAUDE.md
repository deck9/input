# CLAUDE.md - Command Reference & Style Guide

-   Don't waste tokens!

## Build & Test Commands

-   First setup: `cp .env.dev.example .env`, then `mise run up` (composer install, Sail up, migrate, APP_KEY only if empty, npm ci, Vite). Safe to run again.
-   Start: `./vendor/bin/sail up -d`. App: http://localhost:8500
-   S3 storage (optional): rustfs behind the compose profile `s3`, see "S3 Storage" in README.md
-   Migrate: `./vendor/bin/sail artisan migrate`
-   Dev: `npm run dev` (runs Vite development server)
-   Build: `npm run build` (runs lint + type check + builds app)
-   Test JS: `npx vitest run` or `npx vitest run path/to/test.ts` (`npm run test` starts Vitest in watch mode)
-   Test PHP: `./vendor/bin/sail test` or `./vendor/bin/sail test tests/Feature/SpecificTest.php`
-   Lint: `npm run lint` (ESLint for JS/TS/Vue)
-   Type check: `npm run vue-tsc` (TypeScript check)

## Code Style Guidelines

### PHP

-   Follow PSR-1/PSR-2 standards with 4-space indentation
-   Use PascalCase for classes, camelCase for methods, snake_case for variables/DB fields
-   Controllers follow RESTful patterns and use Laravel's validation patterns
-   Use try/catch blocks and return appropriate HTTP status codes

### TypeScript/Vue

-   PascalCase for component names and files
-   Prefix composables with "use" (e.g., useActiveInteractions)
-   Organize imports: external libs first, then internal utilities, then components
-   Use Pinia stores organized by domain (workbench.ts, form.ts)
-   Define explicit types for all models and API responses

### Error Handling

-   Frontend: Promise-based error handling with try/catch
-   Backend: Custom exception handling in Handler.php for API responses
