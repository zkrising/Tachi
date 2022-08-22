export function fmtSgl(sgl: number): string {
	if (sgl < 13) {
		return `☆${sgl.toFixed(2)}`;
	}

	return `🟊${(sgl - 12).toFixed(2)}`;
}
