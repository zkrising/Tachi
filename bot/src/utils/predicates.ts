/**
 * Determines whether an input is a record or not.
 */
export function IsRecord<T = string>(v: unknown): v is Record<string, T> {
	return !!v && typeof v === "object" && !Array.isArray(v);
}
