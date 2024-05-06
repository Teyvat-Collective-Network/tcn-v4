export default function <T, U>(fn: (data: T) => U): (_: { input: T }) => U {
    return ({ input }: { input: T }) => fn(input);
}
