import type { integer } from "../types";
import type { GPTStrings } from "../types/game-config";
import type { GetEnumValue } from "../types/metrics";

export interface GradeBoundary<G extends string> {
	name: G;
	lowerBound: number;
}

export function MakeGradeBoundaries<G extends string>(rec: Record<G, number>) {
	const out: Array<GradeBoundary<G>> = [];

	for (const [name, lowerBound] of Object.entries(rec)) {
		// weird casts here?
		out.push({ name: name as G, lowerBound: lowerBound as number });
	}

	// sort ascendingly
	out.sort((a, b) => a.lowerBound - b.lowerBound);

	return out;
}

type IIDXLikes = GPTStrings["bms" | "iidx" | "pms"];

/**
 * @note - These are *also* grade boundaries for BMS and PMS.
 *
 * There is a **very** specific reason we do the math as
 * (100 * X) / 9
 * and not 100 * (X / 9)
 * Floating point accuracy is hard, and the latter actually results
 * in awful edge case pains.
 * 100 * (7/9) = 77.77777777777779
 * (100*7) / 9 = 77
 * that said, making grade boundaries into ninths was a sick joke.
 */
export const IIDXLIKE_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<IIDXLikes, "grade">>({
	F: 0,
	E: (100 * 2) / 9,
	D: (100 * 3) / 9,
	C: (100 * 4) / 9,
	B: (100 * 5) / 9,
	A: (100 * 6) / 9,
	AA: (100 * 7) / 9,
	AAA: (100 * 8) / 9,
	"MAX-": (100 * 17) / 18,
	MAX: (100 * 9) / 9,
});

export const CHUNITHM_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"chunithm:Single", "grade">>({
	D: 0,
	C: 500_000,
	B: 600_000,
	BB: 700_000,
	BBB: 800_000,
	A: 900_000,
	AA: 925_000,
	AAA: 950_000,
	S: 975_000,
	SS: 1_000_000,
	SSS: 1_007_500,
});

export const WACCA_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"wacca:Single", "grade">>({
	D: 0,
	C: 1, // LOL
	B: 300_100,
	A: 700_000,
	AA: 800_000,
	AAA: 850_000,
	S: 900_000,
	"S+": 930_000,
	SS: 950_000,
	"SS+": 970_000,
	SSS: 980_000,
	"SSS+": 990_000,
	MASTER: 1_000_000,
});

export const JUBEAT_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"jubeat:Single", "grade">>({
	E: 0,
	D: 500_000,
	C: 700_000,
	B: 800_000,
	A: 850_000,
	S: 900_000,
	SS: 950_000,
	SSS: 980_000,
	EXC: 1_000_000,
});

export const ITG_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"itg:Stamina", "grade">>({
	// cannot be achieved. This can only be attained if the player failed the chart.
	F: -Infinity,
	D: 0, // The lowest score you can get in ITG is -400%. Scores "can" go negative.
	// but we don't support it haha lol

	C: 55,
	B: 68,
	A: 80,
	S: 89,
	"★": 96,
	"★★": 98,
	"★★★": 99,
	"★★★★": 100,
});

export const GITADORA_GBOUNDARIES = MakeGradeBoundaries<
	GetEnumValue<GPTStrings["gitadora"], "grade">
>({
	C: 0,
	B: 63,
	A: 73,
	S: 80,
	SS: 95,
	MAX: 100,
});

export const MUSECA_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"museca:Single", "grade">>({
	没: 0,
	拙: 600_000,
	凡: 700_000,
	佳: 800_000,
	良: 850_000,
	優: 900_000,
	秀: 950_000,
	傑: 975_000,
	傑G: 1_000_000,
});

export const MAIMAIDX_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"maimaidx:Single", "grade">>({
	D: 0,
	C: 10,
	B: 20,
	BB: 40,
	BBB: 60,
	A: 80,
	AA: 90,
	AAA: 94,
	S: 97,
	"S+": 98,
	SS: 99,
	"SS+": 99.5,
	SSS: 100,
	"SSS+": 100.5,
});

export const POPN_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<"popn:9B", "grade">>({
	E: 0,
	D: 50_000,
	C: 62_000,
	B: 72_000,
	A: 82_000,
	AA: 90_000,
	AAA: 95_000,
	S: 98_000,
});

type SDVXLikes = GPTStrings["sdvx" | "usc"];

export const SDVXLIKE_GBOUNDARIES = MakeGradeBoundaries<GetEnumValue<SDVXLikes, "grade">>({
	D: 0,
	C: 7_000_000,
	B: 8_000_000,
	A: 8_700_000,
	"A+": 9_000_000,
	AA: 9_300_000,
	"AA+": 9_500_000,
	AAA: 9_700_000,
	"AAA+": 9_800_000,
	S: 9_900_000,
	PUC: 10_000_000,
});
