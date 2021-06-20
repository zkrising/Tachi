/**
 * Cumulative Distribution Function
 * https://en.wikipedia.org/wiki/Cumulative_distribution_function
 */
function cdf(x: number, mean: number, variance: number) {
	return 0.5 * (1 + erf((x - mean) / Math.sqrt(2 * variance)));
}

/**
 * Error Function
 * https://en.wikipedia.org/wiki/Error_function
 */
function erf(x: number) {
	// save the sign of x
	const sign = x >= 0 ? 1 : -1;
	x = Math.abs(x);

	// constants
	const a1 = 0.254829592;
	const a2 = -0.284496736;
	const a3 = 1.421413741;
	const a4 = -1.453152027;
	const a5 = 1.061405429;
	const p = 0.3275911;

	// A&S formula 7.1.26
	const t = 1.0 / (1.0 + p * x);
	const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
	return sign * y; // erf(-x) = -erf(x);
}

function CDFBetween(lowBound: number, highBound: number, mean: number, variance: number) {
	// Since the normal distribution is symmetrical, we want to double this, as the cut will only get one tail.
	return 2 * (cdf(highBound, mean, variance) - cdf(lowBound, mean, variance));
}

// This is a direct port of ESD-JS to typescript. Maybe this should be released as its own module some day.

const MEAN = 0;

/**
 * Gets the percent this score would roughly be, given a standard deviation.
 * @param judgements - The judgements this game uses.
 * @param stddev - The standard deviation to estimate the percent of.
 * @param largestValue - The largest "value" of a judgement in this game. This lets us normalise results.
 * @returns The percent this std. deviation would produce.
 */
function StdDeviationToPercent(
	judgements: ESDJudgementFormat[],
	stddev: number,
	largestValue: number
) {
	let lastJudgeMSBorder = 0;
	let prbSum = 0;

	for (let i = 0; i < judgements.length; i++) {
		const judge = judgements[i];
		const nVal = CDFBetween(lastJudgeMSBorder, judge.msBorder, MEAN, stddev ** 2) * judge.value;
		lastJudgeMSBorder = judge.msBorder;
		prbSum += nVal;
	}

	prbSum /= largestValue;

	return prbSum;
}

const ACCEPTABLE_ERROR = 0.001;
const MAX_ITERATIONS = 50;

export interface ESDJudgementFormat {
	name: string;
	msBorder: number;
	value: number;
}

/**
 * Given judgements and a percent, estimate the standard deviation needed to get a score
 * with that percent.
 * @param judgements - The judgements for this game.
 * @param percent - The percent to estimate SD needed to get.
 * @param errOnInaccuracy - Whether or whether not to throw if the estimate is not accurate enough.
 * @returns
 */
export function CalculateESD(
	judgements: ESDJudgementFormat[],
	percent: number,
	errOnInaccuracy = false
): number {
	if (percent > 1 || percent < 0 || Number.isNaN(percent)) {
		throw new Error(
			"(ESD) Invalid percent. Percent must be between 0 and 1, and also a number."
		);
	}
	const largestValue = judgements.slice(0).sort((a, b) => b.value - a.value)[0].value;

	// massive optimisation possible here by using better initial estimates with precalc'd table of values.
	// until then, it's just kinda slow.
	let minSD = 0;
	let maxSD = 200;
	let estSD = (minSD + maxSD) / 2;

	// So, fundamentally the function that takes SD and returns estimated percent is NOT invertible.
	// as in, it is very literally not invertible.
	// if you figure it out, let me know.
	// until then; we make MAX_ITERATIONS attempts at finding a value within the acceptable range of error.
	// the defaults for these are 100 for iterations, and 0.001 for error.
	// for most of what i've tested, this has been fine.
	for (let i = 0; i < MAX_ITERATIONS; i++) {
		const estimatedPercent = StdDeviationToPercent(judgements, estSD, largestValue);

		if (Math.abs(estimatedPercent - percent) < ACCEPTABLE_ERROR) {
			return estSD;
		}

		if (estimatedPercent < percent) {
			maxSD = estSD;
		} else {
			minSD = estSD;
		}

		if (estSD === (minSD + maxSD) / 2) {
			// if it isn't moving, just terminate
			break;
		}

		estSD = (minSD + maxSD) / 2;
	}

	if (errOnInaccuracy) {
		throw `(ESD-JS) Did not reach value within MAX_ITERATIONS (${MAX_ITERATIONS})`;
	}

	return estSD;
}

/**
 * Compares two ESD values such that 1->2 produces a larger value than 101->102.
 * @param baseESD - The first ESD to compare.
 * @param compareESD - The second ESD to compare.
 * @param cdeg - The degrees of confidence to use. This should be 1.
 * @returns A number between -100 and 100.
 */
export function ESDCompare(baseESD: number, compareESD: number, cdeg = 1): number {
	const CONFIDENCE_DEGREE = cdeg;
	const BASE_CASE = CDFBetween(-1 * CONFIDENCE_DEGREE, CONFIDENCE_DEGREE, 0, 1) / 2;

	let inv = false;
	let variance;
	let bound;
	if (compareESD > baseESD) {
		inv = true;
		variance = compareESD ** 2;
		bound = CONFIDENCE_DEGREE * baseESD;
	} else {
		variance = baseESD ** 2;
		bound = CONFIDENCE_DEGREE * compareESD;
	}

	const esdc = CDFBetween(-1 * bound, bound, 0, variance) / 2;

	let besdc = BASE_CASE - esdc;

	if (inv) {
		besdc *= -1;
	}

	return besdc * 100;
}

/**
 * Converts two percents to ESD, then runs ESDCompare.
 */
export function PercentCompare(
	judgements: ESDJudgementFormat[],
	baseP: number,
	compareP: number,
	cdeg = 1
): number {
	const e1 = CalculateESD(judgements, baseP);
	const e2 = CalculateESD(judgements, compareP);
	return ESDCompare(e1, e2, cdeg);
}
