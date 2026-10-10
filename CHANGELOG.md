# Changelog

All notable changes to Input. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Lines marked **Upgrade step** need you to act after updating.

## [Unreleased]

### Added

-   **Upgrade step:** back up `APP_KEY` together with your database: answers are stored encrypted with it, and a new key can't read them. New hosting docs cover the database, queue worker, scheduler, mail, reverse proxy and backups. (#203)
-   **Upgrade step:** if you deleted a team before this update, its forms are still online. Back up first, then run `php artisan input:prune-orphaned-forms` to list them, and add `--force` to delete them with their answers and files. The hosting docs on backups and updates show the full command. (#209)
-   Fill in text questions from the link: a URL parameter named like a question's Identifier, such as `?email=ada@example.com`, prefills that answer, and the visitor can still change it. The embedding docs show how this works with links, iframes and the native embed. (#208)

### Changed

-   **Upgrade step:** importing a template into a form that already has answers is refused. Import it into a new form instead. Auto-delete needs a retention of at least 1 day (before, a missing retention deleted everything) and also cleans up trashed forms. Deleting an account hands its forms to each team's owner, and deleting a team deletes its forms for good, with their answers and files. Forms of teams deleted before this update stay online until you remove them with `php artisan input:prune-orphaned-forms` (#209). (#202)
-   **Upgrade step:** the minio image can no longer be pulled, so the production compose example now uses RustFS. On the old example, `docker compose pull` fails on the minio service, but a running install keeps working, and `docker compose pull --ignore-pull-failures` gets past the error. A new host, or one without the cached minio image, needs the RustFS setup from the hosting docs. Moving existing files over is a manual copy the docs don't cover. (#203)
-   Docker builds pull their base images from Google's Docker Hub mirror, so they no longer fail on Docker Hub's pull limit. (#195)
-   Checks on a pull request take about 3 minutes instead of 20. (#201)

### Removed

-   The preview-image feature, switched off since 2022, is gone. This drops the Browsershot package with its 6 security advisories, and `npm ci` no longer downloads Chrome when you build from source. (#215)

### Fixed

-   Logic rules work with rating, scale and number answers, and number questions accept answers above 100. Greater and lower than compare only numbers and dates. A failed submit shows a retry message, and a double click no longer submits twice. (#198)
-   Duplicating a form or importing a template keeps its logic rules. (#200)
-   Deleting a form from the trash for good also removes its uploaded files, images and logic rules. (#204)
-   Changing or removing the logo or background on a duplicated form keeps the original form's image. (#205)
-   A show/hide rule on a group now hides or shows all questions in that group in the public form. Group rules you already set up start working after the update, so respondents skip those questions when the rule hides the group. (#206)
-   Answers to questions that a show/hide rule hides at submit are no longer saved, also inside a hidden group and when filled in from the link. A question that shows again before submit keeps its answer. (#210)
-   A form session's "active" check counted every session as active. Nothing in the app depends on it yet. (#194)

### Security

-   **Upgrade step:** check that `APP_URL` is the address Input is served on. Requests for any other host now get a 400 error, also health checks by IP and proxies that don't pass the host on. This keeps forged hosts out of password reset links. The new `TRUSTED_PROXIES` setting limits which proxies are trusted. (#197)
-   **Upgrade step:** form links must start with http(s):// or mailto:. Saved links that don't (like a bare social handle or a www. address) are hidden on the public form: enter them again as full URLs. Templates with such links don't import. Form texts are cleaned before they show. (#193)
-   Webhook responses show as plain text in the submissions view. (#196)
-   Question labels in the logic editor's pickers show as plain text. (#199)

## [2.1.0] - 2026-10-09

### Added

-   Form logic: rules show or hide a question, or jump to another one, based on the answers to other questions. (#176)
-   Rich block text: headings, lists, inline code and images by URL. The completion page is rich text too. (#171)
-   The documentation site lives in the repo, in `docs/`. (#188)

### Changed

-   A member removed from a team loses access to the forms they created in that team. Submission mails then go to the team owner.
-   New forms, questions and answers get a random 16-character id. Existing ids and links keep working.
-   Importing a template keeps the form's own avatar and background images.
-   A question's answer id must be unique within its form and use only letters, numbers, `-` and `_` (max 36 characters).

### Security

-   Fixes access checks between teams: a logged-in user could change other teams' form data through the API. All installs should update. Reported by @tonghuaroot. (#189)
-   Laravel 11.57 and the latest Symfony 6.4/7.4 patch releases, including the fix for webhook requests to internal addresses. (#192)

## Older versions

See [GitHub Releases](https://github.com/deck9/input/releases).

[Unreleased]: https://github.com/deck9/input/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/deck9/input/compare/v2.0.1...v2.1.0
