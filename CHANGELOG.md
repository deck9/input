# Changelog

All notable changes to Input. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Lines marked **Upgrade step** need you to act after updating.

## [Unreleased]

### Added

-   The forms API (`GET /api/forms`) returns when each form last got a submission (`latest_submission_at`) and can sort by it, newest first. Sorting now works only by `name`, `created_at`, `updated_at` or `latest_submission_at`. Other sort values that worked before, like `published_at`, `id` or `uuid`, now give the default order. A dashboard link with an unknown filter or sort now shows your forms. Before, it showed no forms at all. (#242)
-   Search your forms by name, also without accents ("muller" finds "Müller"), and press "/" to jump to the search. The form list has status tabs with counts and sorts by latest submission, last edit, newest or name. Your choice stays in the address, so Back undoes it and a link shows the same list. Dashboard links with the old `?filter=` show all forms. (#248)
-   The form list shows when each form last got a submission, with a blue dot for the last 24 hours, and now opens sorted by latest submission. Its date column shows the date the list is sorted by. (#250)
-   The API can copy a question (`POST /api/blocks/{block}/duplicate`) with its text, settings, answers and Required, but not its rules. The copy goes right after the original. (#262)
-   The form's team can try a form in preview mode, also while it's a draft. Answers in preview mode are never stored or counted and send no webhooks or emails. (#266)
-   Add `?preview=1` to your form's link to try it as a member of its team. Nothing is stored, files aren't uploaded and the form doesn't redirect at the end. (#270)

### Changed

-   The form list keeps each form's status, submissions and actions in view, also with a very long name and on a phone. It shows "40 submissions" with "52 started · 77% finished" below, shows the form's uploaded avatar, and no longer shows the public link under each name. (#244)
-   Each form in the list has one actions menu and a Copy link button. Unpublishing a form with submissions, archiving and deleting now ask first, published forms can be archived, and the list changes without reloading the page. (#245)
-   Archiving a form now also unpublishes it, so Restore brings it back unpublished. This also goes for forms you archived before this update. (#247)
-   The form list loads faster when a team has many forms. It now needs the same few database queries for one form or a hundred. Before, every form added 3 queries. (#256)
-   On screens narrower than 1280 px, a form's editor bar now sits in two rows under the app header: the form with Dashboard and Preview, then Editor, Settings, Integrations and Submissions as tabs. Nothing in it scrolls sideways any more, and the header keeps the logo and your team name. On every screen, keyboard focus in the editor bar and the account menu now shows a blue ring. (#257)
-   A form's pages have one top bar instead of two: the form's name with its menu, a Draft or Live label, the pages, Preview, Publish and your account. Publish first checks for questions without text, rules that point to a deleted question and a missing privacy link. Once the form is live, Share has its link, Open form and Unpublish. On a phone the pages sit in a tab bar at the bottom. (#265)
-   Deleting a question, a group, an answer choice, a consent policy or a logic rule in the form editor now asks first in the app's own dialog. It names the question, how many answers will be deleted with it, and the questions whose rules will stop working. A choice nobody picked, or a policy nobody agreed to, is still deleted at once. (#269)

### Fixed

-   Ticking "Remember me" on the login page now keeps you logged in after your browser session ends. Before, it was ignored. (#227)
-   The counter under the text editor shows the length of your text as soon as a text opens. Before, it showed a larger number until your first edit. (#228)
-   A question or completion page text that holds only an image keeps the image when you save it. Before, it was saved as empty and the image was lost. (#229)
-   The word count under the text editor now counts every word in headings, paragraphs and list items. Before, words on different lines ran together, and a text with only spaces counted 1 word. (#230)
-   Changing a question to a rating or file question no longer shows an error in the browser console. The question list on the left shows its settings as soon as they are set. (#232)
-   The server now limits a file question to 10 files, and only accepts whole-number ids when you change or delete questions, answer options, logic rules, webhooks or submissions. Before, the file limit was only checked in the editor. The update sets a stored file limit above 10, below 1 or in text to 10, and rounds a decimal down. (#233)
-   The form editor tells you when it can't save a change, with the server's reason when there is one. Before, the change looked saved but was lost when you reloaded the page. (#234)
-   A file question now keeps its file limit when several files for one answer are uploaded at the same time. Before, an answer could end up with more files than the question allows. (#235)
-   Fields, switches and selects in the editor and on the login pages now have labels a screen reader reads, and menus and loading spinners have names. Buttons keep focus while they load. (#231)
-   The logic editor ticks the block you picked. Decimal places, max files and max file size are kept in range when saved. A rating whose icon the form can't show now shows stars instead of nothing. (#231)
-   A file upload is now refused when the server can't store the file, and the form asks to try again. Before, the upload looked done, but the submission pointed to a missing file. When the storage can't save, read or delete a file, the log now says why. (#236)
-   The Options and Appearance settings tell you when they can't be saved, with the server's reason when there is one. Before, the save button kept spinning. (#237)
-   Clicking a field's label in the form settings and the question settings now puts the cursor in that field, and screen readers read the label as the field's name. (#238)
-   A form name longer than 255 characters is now refused with a message that says so, and so is an empty name in the settings. Before, a long name failed with a server error on MySQL and MariaDB, and an empty name on every database. The description, language, colors, button label, completion headline and links are checked against their length the same way. (#239)
-   A form whose name starts with an emoji, Chinese text, a sign like "€" or a word like "Müller" or "Fête" shows in your form list and opens. Before, it caused a server error and hid all your forms from the list. (#241)
-   A form keeps its brand or background image when the server can't store the new one, and the Appearance page asks you to try again. Before, the old image was deleted and the form showed none. (#240)
-   "Create form", "From template" and "Duplicate Form" ask for the name in a dialog, and Cancel creates nothing. Before, cancelling "Create form" still made an "Untitled Form". A copy is now named "{name} (copy)". (#243)
-   On a phone, the app header shows the logo and your team name next to the account menu, and screen readers name the account menu. Before, it showed only a gear. (#246)
-   While your forms load, the form list shows placeholder rows. When the list can't load, it says so and offers "Try again". A search or status without forms says so and offers a way back, and screen readers hear how many forms a search finds. Before, all of these said you hadn't created a survey yet. A team without any forms now sees "Create your first form". A form you publish, unpublish, archive or restore in the list moves to its tab right away, and the tab counts follow. (#249)
-   A form template with a description, language, color, button label, completion headline or link that is too long is now refused with a message that names the field, and the form stays as it was. Before, the import failed with a server error on MySQL and MariaDB. (#251)
-   With a dialog open, Tab and Shift+Tab now stay inside the dialog, and closing it puts you back on the button that opened it. Before, Tab moved on to the page behind the dialog. (#252)
-   The form list's dates and blue dots now update while the page stays open, every minute and when you come back to the tab. Before, "12 min ago" stayed until you reloaded the page. The status tab counts and the search count now write numbers like the rest of the list, also in a browser set to another language. (#254)
-   A submission where every question was skipped now counts. Before, a form with only such submissions showed "0 submissions" next to a recent submission date in the form list, and "No submissions found" on its submissions page. Forms with such submissions now show a higher count and completion rate. (#253)
-   A form settings page now saves only its own settings. Before, a bad value saved on another settings page could block the save, with an error about a field that isn't on the page. When a save is refused, the editor keeps what was last saved, so the refused change no longer shows on the other settings pages. A good image upload after a failed one no longer shows the old error. (#255)
-   After you delete an API token or remove a team member with the keyboard, you stay in the list on the next row's button. When the list is now empty, you land on the "Create API Token" or "Add Team Member" heading. Before, you were sent back to the top of the page. (#258)
-   Form settings, questions and template imports now refuse a value that doesn't fit, with a message that names the field, and nothing is changed. This covers a completion text over 65,535 bytes (a letter like "ä" counts as 2), a question title over 1,024 characters, an answer label over 255, a redirect delay or retention period that isn't a whole number or is too big, a negative redirect delay, a yes/no setting with another value, and an unknown answer type in a template. Before, most of these failed with a server error on MySQL and MariaDB, or were saved anyway. (#259)
-   On small phones, the form editor and submissions pages no longer scroll sideways. On phones, the submissions page's "Delete All" and "Download CSV" buttons now sit in their own row. (#260)
-   Questions, answers and template imports now also refuse these values with a message that names the field, and nothing is changed: a question text over 65,535 bytes (a letter like "ä" counts as 2), a webhook address or answer name over 255 characters, a required, hidden or editable value that isn't yes or no, a question or answer position in a template that isn't a whole number, is below zero or is too big, and a template whose answers or logic rules aren't a list. Before, most of these failed with a server error on MySQL and MariaDB, or were saved anyway. A form setting in a template that is only spaces now counts as empty, like on the settings pages, instead of failing. (#261)
-   While the form editor loads your questions, it now shows grey placeholder rows instead of the "Welcome to the Editor" text. When the questions can't load, it says so and offers Try again. Before, a spinner turned forever. (#263)
-   A logic rule that uses or goes to a deleted question, or one of another form, is now refused with a message that names the field. Before, it saved and looked like it worked. The blocks API now lists, for each question, the rules that use it (`used_by`). (#264)

### Security

-   The text editor for questions and the completion page now uses tiptap 3, which fixes a moderate advisory in tiptap 2. Texts you wrote before stay as they are. (#226)
-   Input's UI library, @deck9/ui, no longer pulls in a uuid version with a moderate advisory (GHSA-w5hq-g745-h8pq). Input never used the affected functions. (#231)

## [2.2.0] - 2026-10-11

All installs should update: this release moves Input to Laravel 13, limits the public form endpoints and fixes how links and hosts are checked. It has 9 upgrade steps, marked **Upgrade step** below. Read them before you update, and back up your database and `APP_KEY` first. On SQLite, make sure the disk has room for a second copy of the database: the update rebuilds some tables.

### Added

-   **Upgrade step:** back up `APP_KEY` together with your database: answers are stored encrypted with it, and a new key can't read them. New hosting docs cover the database, queue worker, scheduler, mail, reverse proxy and backups. (#203)
-   **Upgrade step:** if you deleted a team before this update, its forms are still online. Back up first, then run `php artisan input:prune-orphaned-forms` to list them, and add `--force` to delete them with their answers and files. The hosting docs on backups and updates show the full command. (#209)
-   Fill in text questions from the link: a URL parameter named like a question's Identifier, such as `?email=ada@example.com`, prefills that answer, and the visitor can still change it. The embedding docs show how this works with links, iframes and the native embed. (#208)
-   Create a form from a template file on the dashboard with "From template", or through the API with `POST /api/forms/template`. A file that can't be imported shows why and creates no form. (#213, #214)
-   For contributors: browser tests with Laravel Dusk check the login and filling in and submitting a form. They run on every pull request, and `sail dusk` runs them locally on their own database, as "Browser tests" in the README shows. (#221)

### Changed

-   **Upgrade step:** importing a template into a form that already has answers is refused. Import it into a new form instead. Auto-delete needs a retention of at least 1 day (before, a missing retention deleted everything) and also cleans up trashed forms. Deleting an account hands its forms to each team's owner, and deleting a team deletes its forms for good, with their answers and files. Forms of teams deleted before this update stay online until you remove them with `php artisan input:prune-orphaned-forms` (#209). (#202)
-   **Upgrade step:** the minio image can no longer be pulled, so the production compose example now uses RustFS. On the old example, `docker compose pull` fails on the minio service, but a running install keeps working, and `docker compose pull --ignore-pull-failures` gets past the error. A new host, or one without the cached minio image, needs the RustFS setup from the hosting docs. Moving existing files over is a manual copy the docs don't cover. (#203)
-   **Upgrade step:** webhooks and notification mails run in the background, so a submit no longer waits for them. The Docker image runs its own queue worker on the database queue, and a separate worker container is no longer needed. If you pass `QUEUE_CONNECTION=sync` to the container (with `-e`, `environment:` or `env_file:`, as the old Docker Compose example did), change it to `database`, or to `redis` if you run Redis. (#218)
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
-   Only answers on the way a respondent really took through the form are saved. A question skipped by a jump no longer saves its answer, also when filled in from the link. The answer of a skipped or hidden question no longer makes later questions show or hide. After a jump, Back returns to the question the respondent came from, not to a skipped one. (#216)
-   A failed template import shows an error in the settings, such as which link is not allowed or that the form already has answers. Before, nothing happened. (#211)
-   A form session's "active" check counted every session as active. Nothing in the app depends on it yet. (#194)
-   Forms with many submissions load faster: the dashboard, editor and submissions page count answers in the database instead of loading them all, and submitting uses new database indexes. The CSV export works with 10,000 submissions and more, an export without submissions has its header row, and answers starting with = + - @ get a leading `'` so spreadsheets don't run them as formulas. Plain numbers and simple phone numbers like +49 30 1234567 stay as they are. (#217)
-   Webhooks send their custom headers again, such as `Authorization` or an API key, and saving a webhook in the editor keeps headers set through the API. (#218)
-   A webhook whose receiver is down or answers with a server error is tried up to 5 times in all, over about 1 hour 20 minutes. A webhook call stops after 10 seconds, a webhook URL must start with http:// or https://, and the webhook log shows a plain error text when the URL can't be reached. (#218)
-   The webhook log shows how often a webhook was really tried. Before, it stopped counting at 2. (#218)
-   A logo or background whose file is already gone, and shows as a broken image, can be removed again. (#219)
-   The API and template import refuse a group inside a group, and a question in a group that belongs to another form or is missing from the template, so no questions disappear from the public form. Both also refuse a show/hide rule on a group that uses a question inside that group, which sent respondents back to the start. (#220)
-   **Upgrade step:** on SQLite, deleting a team, form, question or submission kept rows in the database: upload records, and on installs set up before v2.0 also answers. The update adds the missing foreign keys, so this no longer happens. To remove what was left behind, back up first, then run `php artisan input:prune-orphaned-forms` and add `--force`. (#225)

### Security

-   **Upgrade step:** check that `APP_URL` is the address Input is served on. Requests for any other host now get a 400 error, also health checks by IP and proxies that don't pass the host on. This keeps forged hosts out of password reset links. The new `TRUSTED_PROXIES` setting limits which proxies are trusted. (#197)
-   **Upgrade step:** form links must start with http(s):// or mailto:. Saved links that don't (like a bare social handle or a www. address) are hidden on the public form: enter them again as full URLs. Templates with such links don't import. Form texts are cleaned before they show. (#193)
-   Webhook responses show as plain text in the submissions view. (#196)
-   Question labels in the logic editor's pickers show as plain text. (#199)
-   Public forms have limits: the image address only serves form logos and backgrounds, in the sizes the form uses. Uploads must match the question's file types, size and count (at most 8 MB per file, also in the editor), answers can be up to 30 KB and form link parameters up to 8 KB. Images and uploads are rate-limited per visitor, so behind a proxy check that `TRUSTED_PROXIES` lists it. (#212)
-   **Upgrade step:** building from source needs Node 22. The Docker image already has it. JavaScript packages with known security advisories are updated, among them axios, lodash, vue-i18n, the text editor's ProseMirror and the build tools Vite and Vitest. (#223)
-   Input runs on Laravel 13 instead of Laravel 11, which no longer gets security fixes. This closes 3 known Laravel security issues, one of them high. Brand image and background uploads refuse SVG files, which never showed. Forms in an iframe on another site now load and submit. Before, they stayed blank. (#224)

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

[Unreleased]: https://github.com/deck9/input/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/deck9/input/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/deck9/input/compare/v2.0.1...v2.1.0
