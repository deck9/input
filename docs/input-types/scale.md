# Scale 📊

The Scale input type presents users with a numerical range from which they can select a single value. It displays as a row of numbered buttons, making it ideal for collecting measured responses on a defined scale.

## How to use:

1. Select **Scale** as the input type
2. Enter the question or prompt
3. Configure the scale options:
   - **Min Rating**: Starting number for the scale (default: 1)
   - **Max Rating**: Ending number for the scale (default: 5)
   - **Left Label**: Text description for the low end of the scale (e.g., "Strongly Disagree")
   - **Right Label**: Text description for the high end of the scale (e.g., "Strongly Agree")
4. Toggle the "Required" option if necessary

## Features:

- **Numerical Presentation**: Clear, numbered buttons for precise value selection
- **Flexible Range**: Customizable minimum and maximum values for any scale size
- **Visual Feedback**: Hover states and clear selection indication
- **Scale Context**: Optional endpoint labels to clarify scale meaning
- **Keyboard Support**: Use number keys for quick selection
- **Clear Option**: Double-click to clear selection (if not required)
- **Responsive Design**: Adapts to different screen sizes

## Example Uses:

- **Agreement Scales**: "From 1-5, how much do you agree with this statement?"
- **Likelihood Measures**: "On a scale of 1-10, how likely are you to recommend us?"
- **Pain Assessment**: "Rate your discomfort from 1-7"
- **Difficulty Rating**: "How challenging was this task on a scale of 1-5?"
- **Satisfaction Surveys**: "Rate your satisfaction from 1-7"
- **NPS (Net Promoter Score)**: Standard 0-10 scale for customer loyalty measurement

::: tip Best Practice 
🌟 Always provide clear context for what the scale represents by adding descriptive labels at the endpoints. Consider using standard scales (1-5, 1-7, or 0-10) that users are familiar with. For analysis purposes, decide in advance whether your scale should have a neutral midpoint (odd number of options) or force a directional choice (even number of options).
:::

## When to use Scale:

- For collecting responses on a clear numerical range
- When you need quantifiable, measurable feedback
- For standardized measurement instruments (like Likert scales)
- When collecting data for statistical analysis
- For questions where intensity or degree matters
- When you want a more formal, numerical presentation than icons

::: warning Note
Scale differs from Rating in its visual presentation. Use Scale when you want a traditional numbered appearance, and use Rating when you want iconic visual feedback (stars, hearts) for a more engaging experience.
:::

