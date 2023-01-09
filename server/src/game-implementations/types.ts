import type { ChartDocument, ConfDerivedMetrics, GPTString } from "tachi-common";
import type { AllConfMetrics, ScoreMetricDeriver } from "tachi-common/types/metrics";

/**
 * Validate this chart-specific metric. This should return a string representing an
 * error message on failure, and null on success.
 */
export type ChartSpecificMetricValidator<GPT extends GPTString> = (
	metric: number,
	chart: ChartDocument<GPT>
) => string | true;

interface ChartDependentMax {
	chartDependentMax: true;
}

/**
 * The only metrics that need validators are those that have `chartDependentMax` set.
 * Otherwise, a validator is built into the ConfScoreMetric.
 */
export type GPTMetricValidators<GPT extends GPTString> = {
	[M in keyof AllConfMetrics[GPT] as AllConfMetrics[GPT][M] extends ChartDependentMax
		? M
		: never]: ChartSpecificMetricValidator<GPT>;
};

export type GPTDerivers<GPT extends GPTString> = {
	// @ts-expect-error This *might* be a bug in the typescript compiler
	// as this works for all GPT inputs normally.
	// Possibly some generic nonsense but like...

	// can you really blame them for this not working?
	// can you? LOOK at what we're doing.
	[K in keyof ConfDerivedMetrics[GPT]]: ScoreMetricDeriver<ConfDerivedMetrics[GPT][K], GPT>;
};

export interface GPTServerImplementation<GPT extends GPTString> {
	validators: GPTMetricValidators<GPT>;
	derivers: GPTDerivers<GPT>;
}

export type GPTImplementations = {
	[GPT in GPTString]: GPTServerImplementation<GPT>;
};
