# Secret Input

The Secret input type lets you securely collect sensitive information from users. It works like a password field, masking the entered text to protect it from view.

## How to use:

1. Choose **Secret** as the input type
2. Enter the question or prompt that asks for sensitive information
3. Optionally, add a placeholder text to guide users on what to enter

::: tip Best Practice
< Only use Secret inputs when necessary for sensitive information like passwords, access codes, or PIN numbers.
:::

## Features:

-   **Text Masking**: Characters are hidden as they're typed (shown as dots or asterisks)
-   **Security**: Protects sensitive information from being visible on screen
-   **Input Validation**: Ensures required fields are filled before proceeding

## Example Uses:

-   **Passwords**: When users need to create or enter a password
-   **PIN Numbers**: For numeric security codes
-   **Access Codes**: For private invitation codes or tokens
-   **Private Information**: Any sensitive data that shouldn't be visible on screen

## When to use Secret inputs:

-   When collecting information that should remain private
-   When users are in public spaces and don't want others to see what they're typing
-   For any authentication or verification processes
-   When compliance or security requirements mandate protected input fields

::: warning Security Note
While Secret inputs hide information on screen, remember that this is a visual protection only. For truly sensitive information, ensure you have proper encryption and security measures in place for data transmission and storage.
:::
