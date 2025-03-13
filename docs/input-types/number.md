# Number 🔢

The Number input type is specifically designed for collecting numerical data with precise formatting and validation. It's ideal for quantities, measurements, financial values, and any data that requires numeric entry.

## How to use:

1. Choose **Number** as the input type
2. Enter the question or prompt
3. Configure the number options:
   - **Decimal Places**: How many decimal digits to allow (0-10)
   - **Symbol**: Optional character(s) to display before the number (e.g., $, €, %)
   - **Placeholder**: Hint text to show when the field is empty
4. Toggle the "Required" option if necessary

## Features:

- **Proper Formatting**: Automatic thousands separators for readability
- **Decimal Precision**: Control exactly how many decimal places are allowed
- **Symbol Display**: Optional currency or unit symbol in a highlighted box
- **Right Alignment**: Numbers are right-aligned following standard conventions
- **Specialized Keyboard**: Mobile devices show a numeric keyboard for easier entry
- **Format Validation**: Ensures users can only enter valid numbers
- **Visual Feedback**: Numeric icon displays when no symbol is specified

## Example Uses:

- **Quantities**: "How many items would you like to order?"
- **Financial Values**: "What is your monthly budget?"
- **Measurements**: "Enter your height in centimeters"
- **Age**: "What is your age?"
- **Percentages**: "What percentage of time do you spend on this activity?"
- **Ratings**: "On a scale from 0-100, how would you rate this product?"

::: tip Best Practice
🌟 Always specify the units of measurement in your question or by using the symbol feature. For decimal inputs, clearly indicate how precise the answer should be. When collecting financial data, use the symbol feature to indicate currency.
:::

## When to use Number inputs:

- When you need strictly numerical data for calculations or analysis
- For quantities, measurements, or amounts
- When precision matters (using decimal places control)
- For financial information with proper formatting
- When you need to restrict input to numeric values only
- When you want proper numeric formatting (thousands separators)

::: warning Note
Remember that Number inputs only accept numeric values. If users might need to add any text or explanations with their numbers, consider using a Short Text input instead and add validation.
:::

## Technical Details:

- Numbers are displayed with proper thousands separators
- For decimal inputs, the step size is automatically set based on decimal places
- When decimal places is set to 0, only integers can be entered
- Mobile devices will show the appropriate keyboard type based on your decimal configuration