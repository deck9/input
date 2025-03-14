# Managing Form Submissions

When you create forms with Input, the submissions from your users are securely stored and can be easily accessed, analyzed, and exported. This guide will show you how to work with the submissions that have been collected by your forms.

## Accessing Form Submissions

To view submissions for a specific form:

1. Navigate to the Input dashboard
2. Find the form you want to review submissions for
3. Click on the form name or the "Submissions" button
4. You will be taken to the Submissions page for that form

## Submissions View Options

The Submissions page offers two different view modes:

### Table View (Default)

The Table View displays each individual submission in a tabular format:

-   Each row represents one complete form submission
-   Columns show individual form responses
-   The date and time of submission is displayed
-   A unique submission ID is provided

![Submissions Table View - Screenshot Placeholder]

### Summary View

The Summary View provides an aggregated analysis of your submissions:

-   For multiple choice questions: shows response distributions with visual graphs
-   For text inputs: displays common responses
-   For numerical inputs: shows average values and ranges
-   For rating scales: presents average ratings with visual indicators

To switch between views:

1. Click on "Submissions" button for the Table View
2. Click on "Summary" button for the Summary View

![Submissions Summary View - Screenshot Placeholder]

## Exporting Submissions

Input allows you to export submissions for external analysis or record-keeping:

1. From the Submissions page, click the "Download CSV" button
2. A CSV file will be generated containing all form submissions
3. The file will include all form fields and responses

The exported CSV file:

-   Contains one row per submission
-   Includes timestamps and unique identifiers
-   Can be opened in spreadsheet applications like Excel or Google Sheets

## Managing Submission Data

### Deleting Submissions

If you need to remove all submissions for a form:

1. From the Submissions page, click the "Delete All" button
2. Confirm the deletion in the prompt that appears
3. All submission data for this form will be permanently removed

::: warning Important
Deleting submissions is permanent and cannot be undone. Make sure to export your data before deleting if you need to keep a record.
:::

### Auto-Deletion Settings

Input can automatically delete old submissions to help with data management:

1. Navigate to the form settings
2. Look for the "Privacy" section
3. Enable the auto-delete option and set a retention period
4. Submissions older than the specified period will be automatically removed

## Submission Webhooks

For information about receiving real-time notifications of new submissions via webhooks, see the [Webhooks and Integrations](/webhooks-integrations) documentation.
