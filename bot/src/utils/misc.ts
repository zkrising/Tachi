/**
 * Random From Array - Selects a random value from an array.
 */
export function RFA<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

export function TruncateString(string: string, len = 30) {
	if (string.length < len) {
		return string;
	}

	return `${string.slice(len - 3)}...`;
}
