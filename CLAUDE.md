# CLAUDE.md - Command Reference & Style Guide

-   Don't waste tokens!

## Build & Test Commands

-   First setup: `cp .env.dev.example .env`, then set `FILESYSTEM_DRIVER=local` in `.env` (the `minio` image can no longer be pulled). Then `mise run up` (composer install, Sail up, migrate, key:generate, npm ci, Vite). Its plain `sail up -d` step fails on the missing `minio` image: run the Start line below instead and finish the remaining steps by hand. Only once: `key:generate` replaces APP_KEY.
-   Start: `./vendor/bin/sail up -d --no-deps laravel.test mariadb redis mailhog mariadb.test`. App: http://localhost:8500
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
