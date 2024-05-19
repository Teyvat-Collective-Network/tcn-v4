export function pick<T extends Record<string, any>, U extends (keyof T)[]>(object: T, ...keys: U): Pick<T, U[number]> {
    return Object.fromEntries(keys.map((key) => [key, object[key]])) as Pick<T, keyof T>;
}
