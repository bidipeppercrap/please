export function toStringDelimit(number = 0) {
    const delimitFormatter = new Intl.NumberFormat('en-US');

    return delimitFormatter.format(number);
}