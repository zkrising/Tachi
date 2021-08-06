export function RFA<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export const NO_OP = () => void 0;

export function UppercaseFirst(str: string) {
	return str[0].toUpperCase() + str.substring(1);
}

export function IsNullish(value: unknown) {
	return value === null || value === undefined;
}
