export function romanize(num: number): false | string {
    let digits = String(+num).split("")
    let roman = "",
        i = 3;

    const key = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM",
        "", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC",
        "", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]

    while (i--) {
        let popped = digits.pop()

        if (popped) {
            roman = (key[parseInt(popped) + (i * 10)] || "") + roman;
        }
    }

    return Array(+digits.join("") + 1).join("M") + roman;
}
