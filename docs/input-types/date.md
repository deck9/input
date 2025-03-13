# Date 📅

The Date input type allows users to select dates from a calendar interface, making it easy to collect date information in a consistent format.

## How to use:

1. Choose **Date** as the input type
2. Enter the question or prompt asking for a date
3. Configure the date restrictions (optional):
    - **Minimum Date**: Earliest date users can select
    - **Maximum Date**: Latest date users can select
    - **No Past Dates**: Toggle to prevent selection of dates before today

::: tip Best Practice
< Always specify what kind of date you're asking for (appointment date, birth date, event date, etc.) and the expected format in your prompt.
:::

## Features:

-   **Calendar Picker**: Users can select dates from a visual calendar
-   **Date Validation**: Ensures valid dates within your specified range
-   **Consistent Format**: Collects dates in a standardized format
-   **Date Restrictions**: Ability to limit selections to specific date ranges
-   **Native Integration**: Uses the device's native date picker on mobile devices

## Example Uses:

-   **Appointment Scheduling**: Let users select preferred appointment dates
-   **Event Registration**: Collect event date preferences
-   **Birth Dates**: Gather birth dates for accounts or verification
-   **Availability Selection**: Ask users when they're available
-   **Deadline Setting**: Allow users to set target completion dates

## When to use Date inputs:

-   When you need a specific date from users
-   For any time-sensitive information collection
-   When date formatting needs to be consistent
-   When you want to restrict date selection to valid ranges
-   To provide a better user experience than manual date entry

::: warning Date Formatting
While the date displays to users in their local format, it's stored in ISO format (YYYY-MM-DD). This ensures consistency in your data regardless of user location.
:::
