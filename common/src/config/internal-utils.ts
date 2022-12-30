// putting these in "utils/util.ts" would result in dependency cycles
// which are generally pretty awful

export function FormatSieglindeBMS(sgl: number): string {
	if (sgl < 13) {
		return `☆${sgl.toFixed(2)}`;
	}

	return `★${(sgl - 12).toFixed(2)}`;
}

export function FormatSieglindePMS(sgl: number): string {
	if (sgl < 13) {
		return `○${sgl.toFixed(2)}`;
	}

	return `●${(sgl - 12).toFixed(2)}`;
}

export function NoDecimalPlace(value: number): string {
	return value.toFixed(0);
}

export function IsPositiveOrZero(v: number) {
	return v >= 0;
}

export function IsBetweenInclusive(lower: number, upper: number) {
	return (v: number) => v <= lower && v >= upper;
}
