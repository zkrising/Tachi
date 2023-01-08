import type {
	GPTString,
	Judgements,
	Playtype,
	ScoreDocument,
	integer,
	OptionalMetrics,
	ConfProvidedMetrics,
} from "tachi-common";
import type { ExtractMetrics } from "tachi-common/types/metrics";
import type { Mutable } from "utils/types";

/**
 * ScoreData, but it's just the provided metrics (and enumIndexes don't exist).
 */
export type DryScoreData<GPT extends GPTString> = ExtractMetrics<ConfProvidedMetrics[GPT]> & {
	optional: Mutable<OptionalMetrics[GPT]>;
	judgements: Partial<Record<Judgements[GPT], integer | null>>;
};

/**
 * An intermediate score format that will be fully filled out by
 * HydrateScore.
 */
export type DryScore<GPT extends GPTString = GPTString> = Pick<
	ScoreDocument<GPT>,
	"comment" | "game" | "importType" | "scoreMeta" | "service" | "timeAchieved"
> & {
	scoreData: DryScoreData<GPT>;
};

export type ScorePlaytypeMap = Partial<Record<Playtype, Array<ScoreDocument>>>;
export type ChartIDPlaytypeMap = Partial<Record<Playtype, Set<string>>>;
