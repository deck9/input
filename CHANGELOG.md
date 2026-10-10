# Changelog

All notable changes to Input. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Lines marked **Upgrade step** need you to act after updating.

## [Unreleased]

### Added

-   **Upgrade step:** back up `APP_KEY` together with your database: answers are stored encrypted with it, and a new key can't read them. New hosting docs cover the database, queue worker, scheduler, mail, reverse proxy and backups, and the production compose example uses RustFS instead of the minio image, which can no longer be pulled. (#203)

### Changed

-   **Upgrade step:** importing a template into a form that already has answers is refused. Import it into a new form instead. Auto-delete needs a retention of at least 1 day (before, a missing retention deleted everything) and also cleans up trashed forms. Deleting an account hands its forms to each team's owner, and deleting a team deletes its forms for good, with their answers and files. (#202)
-   Docker builds pull their base images from Google's Docker Hub mirror, so they no longer fail on Docker Hub's pull limit. (#195)
-   Checks on a pull request take about 3 minutes instead of 20. (#201)

### Fixed

-   Logic rules work with rating, scale and number answers, and number questions accept answers above 100. Greater and lower than compare only numbers and dates. A failed submit shows a retry message, and a double click no longer submits twice. (#198)
-   Duplicating a form or importing a template keeps its logic rules. (#200)
-   Deleting a form from the trash for good also removes its uploaded files, images and logic rules. (#204)
-   Changing or removing the logo or background on a duplicated form keeps the original form's image. (#205)
-   A form session's "active" check counted every session as active. Nothing in the app depends on it yet. (#194)

### Security

-   **Upgrade step:** check that `APP_URL` is the address Input is served on. Requests for any other host now get a 400 error, also health checks by IP and proxies that don't pass the host on. This keeps forged hosts out of password reset links. The new `TRUSTED_PROXIES` setting limits which proxies are trusted. (#197)
-   Form texts are cleaned before they show. Form links accept only http(s) and mailto: other saved links are hidden on the public form, and templates with them don't import. (#193)
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
