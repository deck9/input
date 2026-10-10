# Embedding Forms

Input forms can be easily embedded into your website or application. This guide explains the different embedding options and how to customize the appearance and behavior of embedded forms.

## Embedding Options

Input offers three ways to embed your form:

### 1. iFrame Embedding

The simplest way to embed a form is using an iFrame. This method works on any website:

1. Go to your form settings
2. Click on the "Embed" tab
3. Select "iFrame" as the embed type
4. Copy the generated iFrame code
5. Paste the code into your website's HTML

Example iFrame code:

```html
<iframe
    src="https://app.getinput.co/form-uuid?iframe=1"
    width="100%"
    height="520px"
    frameborder="0"
    marginheight="0"
    marginwidth="0"
></iframe>
```

### 2. Embed Link

For situations where you just need a direct link to your form:

1. In the form settings, go to the "Embed" tab
2. Select "Embed Link" as the embed type
3. Copy the generated URL
4. Use this URL in links, emails, or messages

The embed link includes parameters that optimize the form for embedding and can be customized with additional options.

### 3. Native Embedding (Experimental)

For advanced integration, Input offers a JavaScript-based native embedding:

1. In the form settings, go to the "Embed" tab
2. Select "Native (Experimental)" as the embed type
3. Copy both code snippets provided
4. Place the first snippet where you want the form to appear
5. Place the script tag before the closing body tag of your page

Example native embed code:

```html
<!-- Place this wherever you want to embed your form -->
<div
    id="form-uuid-wrapper"
    class="ipt"
    style="height: 520px; width: 100%;"
></div>

<!-- Place this before the closing body tag -->
<script
    src="https://app.getinput.co/js/classic.js"
    data-form="form-uuid"
    data-server-url="https://app.getinput.co"
    data-hide-title="false"
    data-autofocus="false"
    data-alignleft="false"
    data-hide-navigation="false"
    async
></script>
```

::: info
The native embedding option provides better integration with your website's styles and behavior but is marked as experimental as it may change in future updates.
:::

## Customization Options

You can customize how your embedded form looks and behaves by adjusting these options:

### Height Configuration

-   **Use full height**: Makes the form take up 100% of its container's height
-   **Custom height**: Specify a fixed height in pixels for the form

### Appearance Options

-   **Spacing top**: Adjust the space above the form (in pixels)
-   **Hide title**: Remove the form title from display
-   **Hide navigation**: Hide the navigation controls
-   **Autofocus on load**: Automatically focus the first input field when the form loads
-   **Align left**: Left-align the form content instead of center alignment

## URL Parameters

You can further customize embedded forms by adding parameters to the embed URL:

| Parameter        | Description                 | Values        |
| ---------------- | --------------------------- | ------------- |
| `iframe`         | Enables iframe mode         | `1`           |
| `hideTitle`      | Hides the form title        | `1`           |
| `hideNavigation` | Hides navigation buttons    | `1`           |
| `focusOnMount`   | Focuses first input on load | `1` or `0`    |
| `alignLeft`      | Left-aligns form content    | `1`           |
| `spacing`        | Sets top spacing in pixels  | Numeric value |

Example URL with parameters:

```
https://app.getinput.co/form-uuid?iframe=1&hideTitle=1&alignLeft=1
```

## Prefill Questions

You can fill in answers with URL parameters. The parameter name is the question's Identifier (open the question, then "More Settings"). For example, this fills the question with the Identifier `email`:

```
https://app.getinput.co/form-uuid?email=ada@example.com
```

-   Works for short text, long text, email, number, phone and link questions. Parameters for other question types or unknown Identifiers are ignored.
-   The question still shows, so the visitor can check and change the answer. A question skipped by a jump doesn't send its prefilled answer.
-   The value shows as plain text. Encode special characters: `%2B` for `+`, `%20` for a space.
-   Number questions take digits with a dot as decimal separator, like `price=12.5`, rounded to the question's decimal places. Anything else is ignored.
-   Show/hide rules treat a prefilled answer like a typed one.
-   The match is case-sensitive. `iframe`, `hideTitle`, `hideNavigation`, `focusOnMount` and `alignLeft` never fill a question.

Where the parameters go depends on how you embed the form:

-   **Embed Link**: add them to the link.
-   **Native Embedding**: the form reads the URL of your page, so `https://example.com/signup?email=ada@example.com` fills the question.
-   **iFrame**: the form only sees the `src` URL of the iframe, not the URL of your page. Add the parameters to the `src`, or pass your page's parameters on with a small script:

```html
<iframe id="input-form" width="100%" height="520px" frameborder="0"></iframe>
<script>
    document.getElementById("input-form").src =
        "https://app.getinput.co/form-uuid?iframe=1&" +
        new URLSearchParams(window.location.search);
</script>
```

## Troubleshooting

### Form Not Displaying

If your embedded form isn't appearing:

-   Check that your form is published
-   Verify the form UUID in your embed code is correct
-   Ensure there are no Content Security Policy (CSP) issues on your site

### Styling Issues

If the form doesn't look right:

-   Try adjusting the height and width settings
-   Check if your website's CSS is interfering with the form
-   Test different embedding options to see which works best

### Loading Problems

If the form is slow to load:

-   Ensure your website's connection is stable
-   Check for JavaScript errors in your browser console
-   Consider using the iFrame option if the native embedding is problematic
