# Webhooks and Integrations

Input allows you to connect your forms with other tools and services through webhooks. This lets you automatically send form submission data to other applications, enabling you to create powerful workflows and integrations.

## What Are Webhooks?

Webhooks are a way for different applications to communicate in real-time. When a specific event happens in Input (like a form submission), a webhook sends that data to another application automatically.

## Setting Up Webhooks

### Accessing Webhook Settings

To set up webhooks for your form:

1. Navigate to the Input dashboard
2. Select the form you want to add webhooks to
3. Click "Integrations" in the main navigation
4. You'll see the webhooks configuration page

![Webhooks Configuration Page - Screenshot Placeholder]

### Creating a New Webhook

To add a new webhook:

1. Click the "Add Webhook" button
2. Enter the URL where submission data should be sent
3. Select the HTTP method (typically POST)
4. Add any custom headers if needed
5. Save the webhook configuration

::: info
Your webhook endpoint should be able to receive JSON data and return a successful HTTP status code (200-299).
:::

## Supported Integration Platforms

Input offers simplified setup for popular integration platforms:

### Make (formerly Integromat)

Make is a powerful automation platform that connects Input to hundreds of other apps:

1. Click the "Connect with Make" button in the Integrations section
2. Follow the setup instructions to create a new scenario in Make
3. Use the provided webhook URL in your Input configuration

![Make Integration - Screenshot Placeholder]

## Webhook Payload Format

When a form is submitted, Input sends a JSON payload to your webhook URL with the following structure:

```json
{
    "id": "123",
    "uid": "unique-session-token",
    "form": "form-uuid",
    "started_at": "2023-06-15 09:32:45",
    "completed_at": "2023-06-15 09:35:12",
    "params": {
        "utm_source": "email",
        "utm_campaign": "summer_promo"
    },
    "responses": {
        "block-uuid-1": {
            "answer": "Jane Doe",
            "message": "What is your name?",
            "data": [
                {
                    "id": "block-uuid-1",
                    "message": "What is your name?",
                    "name": "Name field",
                    "value": "Jane Doe",
                    "original": "Jane Doe",
                    "type": "input"
                }
            ]
        },
        "block-uuid-2": {
            "answer": "jane@example.com",
            "message": "Your email address",
            "data": [
                {
                    "id": "block-uuid-2",
                    "message": "Your email address",
                    "name": "Email field",
                    "value": "jane@example.com",
                    "original": "jane@example.com",
                    "type": "email"
                }
            ]
        },
        "block-uuid-3": {
            "answer": "4",
            "message": "Rate your experience",
            "data": [
                {
                    "id": "block-uuid-3",
                    "message": "Rate your experience",
                    "name": "Rating field",
                    "value": "4",
                    "original": 4,
                    "type": "rating"
                }
            ]
        }
    }
}
```

The `responses` object contains all form responses organized by block UUID. Each response includes:

-   `answer`: The formatted answer value
-   `message`: The question text
-   `data`: Detailed information about the response including original values and type

## Testing Webhooks

Before using your webhook in production:

1. Set up your webhook endpoint
2. Submit a test entry to your form
3. Verify the data was received correctly by your webhook endpoint
4. Check the submission's webhook status indicator to verify successful delivery

## Monitoring Webhook Status

Input provides status information for webhook calls made for each submission:

1. Go to the Submissions page of your form
2. In the table view, each submission has a webhook status indicator in the session info column
3. Click on the status indicator to see details including:
    - Status code returned
    - Response from the endpoint
    - Timestamp of the call

![Webhook Status Indicator - Screenshot Placeholder]

## Common Integration Use Cases

### CRM Integration

Send form submissions directly to your CRM system:

-   Create new contacts or leads
-   Update existing customer records
-   Track customer interactions

### Email Marketing

Connect forms to your email marketing platform:

-   Add subscribers to mailing lists
-   Trigger personalized email campaigns
-   Update subscriber preferences

### Project Management

Feed form data into project management tools:

-   Create new tasks or tickets
-   Assign work based on form responses
-   Update project documentation

### Custom Applications

Send data to your own applications:

-   Store responses in your database
-   Trigger custom business logic
-   Generate personalized content

## Troubleshooting

### Webhook Not Working

If your webhook isn't receiving data:

-   Verify the webhook URL is correct and accessible
-   Check that your form is properly published
-   Review the webhook status in the submission details for error messages
-   Ensure your endpoint returns a successful status code

### Handling Failed Webhooks

If a webhook fails:

1. Input will automatically retry the webhook up to 3 times
2. Check the webhook status indicator in the submission table for error details
3. Fix any issues with your endpoint
4. Resubmit a test entry to verify the fix

::: tip
For development and testing, consider using a service like [Webhook.site](https://webhook.site) to create a temporary endpoint that shows all incoming requests.
:::

## Rate Limits and Quotas

-   Webhooks are included in all Input plans
-   There are no artificial rate limits on webhooks
-   For high-volume forms, consider optimizing your webhook endpoint for performance
