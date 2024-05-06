export function fuzzy(string: string, query: string): boolean {
    const lower = query.toLowerCase();
    string = string.toLowerCase();

    let index = 0;
    for (const char of lower) {
        if ((index = string.indexOf(char, index)) === -1) return false;
        index++;
    }

    return true;
}
