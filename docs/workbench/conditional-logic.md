# Conditional Logic in Forms

Conditional logic allows you to create dynamic forms that respond to user input, showing or hiding questions or jumping to specific sections based on responses. This guide will help you set up and use conditional logic effectively in your forms.

## What is Conditional Logic?

Conditional logic lets you control the flow of your form based on how users respond to questions. With conditional logic, you can:

-   **Show or hide** specific blocks based on responses
-   **Jump to** specific blocks after a user answers a question
-   Create personalized form experiences for different users

## Adding Logic Rules to a Block

To add logic to any block in your form:

1. Select the block you want to apply logic to
2. Click the **Block Logic** button in the block footer
3. In the slide-out panel that appears, click the **Rule** button to add a new rule
4. Give your rule a descriptive name (e.g., "Skip to payment if premium selected")
5. Configure your conditions and actions (detailed below)
6. Click **Save** to apply the logic rule

Each block can have multiple logic rules that will be evaluated in the order they appear.

## Setting Up Conditions

Each logic rule consists of one or more conditions that determine when the rule's action will be triggered:

1. Select a **Source Block** – The block whose response you want to evaluate
2. Choose an **Operator** – How you want to compare the response
3. Enter a **Value** – What you want to compare against

### Available Operators

-   **is equal to** – Exact match (e.g., "yes" = "yes")
-   **is not equal to** – Anything except an exact match
-   **contains** – Response includes the specified text
-   **does not contain** – Response doesn't include the specified text
-   **is lower than** – Response value is less than specified value
-   **is greater than** – Response value is greater than specified value

### Combining Multiple Conditions

You can add multiple conditions to a rule by clicking the **Condition** button. Conditions can be combined with:

-   **AND** – All conditions must be true for the rule to trigger
-   **OR** – Any condition can be true for the rule to trigger

Example:

```
IF (Question 1 = "Yes" AND Question 2 = "Premium") OR (Question 3 = "Business")
THEN show the discount block
```

## Actions

After setting up your conditions, you need to specify what should happen when those conditions are met:

### Show/Hide Blocks

-   **Show** – The block will only be visible when conditions are met
-   **Hide** – The block will be hidden when conditions are met

Show/hide logic is evaluated before displaying blocks, so users won't see blocks that are hidden by logic rules.

### Go to a Specific Block

-   **Go to** – When conditions are met, the form will jump to a specific block

Go to logic is evaluated after a user interacts with the current block. When selecting "Go to" as your action, you'll need to choose which block to jump to from a dropdown menu.

## Logic Visualization

Blocks with logic rules applied are indicated by a blue highlight on the **Block Logic** button. If a block has multiple rules, a counter will show the number of applied rules (e.g., "Block Logic (2)").

When viewing the Storyboard with logic visualization enabled, you can see a visual representation of all logic rules, making it easier to understand your form's conditional flow.

## Best Practices

1. **Use descriptive rule names** – This helps you identify rules when you have multiple logic conditions
2. **Test your logic thoroughly** – Preview your form and test all possible answer combinations
3. **Keep it simple** – Complex nested logic can be difficult to maintain
4. **Consider user experience** – Avoid confusing jumps that might disorient users
5. **Plan your logic** – Sketch out your form flow before implementing complex logic

## Examples

### Example 1: Skipping Irrelevant Questions

If a user answers "No" to "Do you own a car?", you can hide all car-related questions:

```
Block: Car Ownership Question
Rule: Hide car questions
Condition: Response = "No"
Action: Go to Insurance Questions Block
```

### Example 2: Showing Additional Fields

If a user selects "Other" from a list of options, you can show a text field for them to specify:

```
Block: How did you hear about us?
Rule: Show specification field
Condition: Response = "Other"
Action: Show (applied to the "Please specify" block)
```

### Example 3: Creating Branching Paths

Create different experiences based on product selection:

```
Block: Product Selection
Rule: Premium Path
Condition: Response = "Premium Plan"
Action: Go to Premium Features Block

Rule: Basic Path
Condition: Response = "Basic Plan"
Action: Go to Standard Features Block
```

## Troubleshooting

-   **Logic not working?** Check that your source blocks, conditions, and values match exactly
-   **Unexpected jumps?** Review all logic rules to ensure they don't conflict
-   **Blocks still showing when they should be hidden?** Ensure your conditions are correctly set up
-   **Form getting stuck?** Make sure your goto logic doesn't create infinite loops
