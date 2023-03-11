import { Ref, ref } from "vue";

export function addThousandsSeparator(value: string, separator = "."): string {
    return value
        .split("")
        .reverse()
        .reduce((acc, curr, index) => {
            if (index % 3 === 0 && index !== 0) {
                return `${curr}${separator}${acc}`;
            } else {
                return `${curr}${acc}`;
            }
        }, "");
}

export function useFixedNumberFormatting(
    event: Event,
    options: {
        decimalPlaces: number;
        thousandSeparator?: string;
        decimalSeparator?: string;
    } = {
        decimalPlaces: 2,
        thousandSeparator: ".",
        decimalSeparator: ",",
    }
): {
    formatted: Ref<string>;
    output: Ref<number>;
} {
    const output = ref(0);
    const formatted = ref("0");

    const thousandSeparator =
        typeof options.thousandSeparator === "undefined"
            ? "."
            : options.thousandSeparator;
    const decimalSeparator =
        typeof options.decimalSeparator === "undefined"
            ? ","
            : options.decimalSeparator;

    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;

    let cursorPosition = inputElement?.selectionStart ?? 0;
    const unformattedStringLength = inputElement?.value.length;

    // ignore all thousandSeperators in input
    inputValue = inputValue.replaceAll(thousandSeparator, "");

    // regex that validates the input two have optionally 2 decimal places separated by a comma
    const regex =
        options.decimalPlaces > 0
            ? new RegExp(
                  `-?(\\d+)(${decimalSeparator}\\d{0,${options.decimalPlaces}})?`
              )
            : new RegExp(`-?(\\d+)`);

    // format the input for decimal values
    const matchedString = regex.exec(inputValue);

    if (matchedString) {
        // we save the input value without thousand separators and convert it to a number
        if (decimalSeparator !== ".") {
            output.value = parseFloat(
                matchedString[0].replace(decimalSeparator, ".")
            );
        } else {
            output.value = parseFloat(matchedString[0]);
        }

        // add thousand separators to first part of number
        let formattedOutput = addThousandsSeparator(
            matchedString[1],
            thousandSeparator
        );

        // add decimal separator and decimal places if they exist
        if (options.decimalPlaces > 0 && matchedString[2]) {
            formattedOutput += matchedString[2];
        }

        // set the formatted value to the input element
        inputElement.value = formattedOutput;

        // try to retain the cursor position after setting the formatted value to the input element
        cursorPosition += formattedOutput.length - unformattedStringLength;

        inputElement.selectionStart = cursorPosition;
        inputElement.selectionEnd = cursorPosition;
    }

    return {
        formatted,
        output,
    };
}
