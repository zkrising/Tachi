import type { ConfDerivedMetrics, GPTString } from "tachi-common";
import type { ScoreMetricDeriver } from "tachi-common/types/metrics";

export type GPTDerivers<GPT extends GPTString> = {
	// @ts-expect-error This *might* be a bug in the typescript compiler
	// as this works for all GPT inputs normally.
	// Possibly some generic nonsense but like...

	// can you really blame them for this not working?
	// can you? LOOK at what we're doing.
	[K in keyof ConfDerivedMetrics[GPT]]: ScoreMetricDeriver<ConfDerivedMetrics[GPT][K], GPT>;
};
