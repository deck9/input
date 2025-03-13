# Short Text 💬

The Short Text input type provides a single-line text field for collecting brief responses from users. It's perfect for names, titles, brief answers, and any situation where responses are concise and fit on one line.

## How to use:

1. Choose **Short Text** as the input type
2. Enter the question or prompt
3. Configure the input options:
   - **Placeholder**: Hint text shown when the field is empty
4. Toggle the "Required" option if necessary

## Features:

- **Single-line Input**: Optimized for brief responses
- **Character Counter**: Real-time display of characters used out of 100
- **Character Limit**: Enforced 100-character maximum length
- **Visual Feedback**: Counter displays character limits
- **Focused Design**: Single-line layout encourages concise answers
- **Mobile Friendly**: Works well on all device sizes

## Example Uses:

- **Names**: "What is your full name?"
- **Titles**: "What is your job title?"
- **Brief Answers**: "What's your favorite color?"
- **Identifiers**: "What is your employee ID?"
- **Short Responses**: "Describe your role in one sentence"
- **Simple Data**: "What city do you live in?"

::: tip Best Practice 
🌟 Keep your questions specific to encourage brief responses. For any question where you expect answers might exceed a few words or require multiple sentences, use the Long Text input type instead.
:::

## When to use Short Text:

- When you need a brief, concise response
- For single-line information collection
- When responses shouldn't exceed a sentence
- For structured data like names, locations, or identifiers
- When you want to limit response length
- When inputs should be quick and straightforward

::: warning Note
Short Text fields have a hard limit of 100 characters. If users might need more space, consider using a Long Text input instead, which can accommodate more detailed responses.
:::

## Technical Details:

- Maximum character limit is fixed at 100 characters
- Input is single-line only (pressing Enter submits the form)
- Character counter updates in real-time as users type
- Unlike specialized inputs (email, phone, etc.), Short Text has no format validation