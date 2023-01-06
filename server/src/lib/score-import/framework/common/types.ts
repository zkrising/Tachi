import type {
	ProvidedMetrics,
	GPTString,
	Judgements,
	Playtype,
	ScoreDocument,
	integer,
	OptionalMetrics,
} from "tachi-common";
import type { EnumValue } from "tachi-common/types/metrics";

/**
 * For dry scores, we don't want to make converters fill out enum values as
 *
 * grade: { string: "A", index: 5 }
 *
 * The index part can *always* be derived. This function turns
 */
type ExtractEnumValues<TMetrics extends Record<string, unknown>> = {
	[K in keyof TMetrics]: TMetrics[K] extends EnumValue<infer V> ? V : TMetrics[K];
};

type DryScoreData<GPT extends GPTString> = ExtractEnumValues<ProvidedMetrics[GPT]> & {
	optional: ExtractEnumValues<OptionalMetrics[GPT]>;
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
