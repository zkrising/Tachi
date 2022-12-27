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

export function FormatMaimaiDXRating(rating: number): string {
	return rating.toFixed(0);
}
