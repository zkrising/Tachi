import type {
	GPTString,
	Playtype,
	ProvidedMetrics,
	ScoreDocument,
	ExtractedOptionalMetrics,
	Judgements,
	integer,
} from "tachi-common";

/**
 * An intermediate score format that will be fully filled out by
 * HydrateScore.
 */
export type DryScore<GPT extends GPTString = GPTString> = Pick<
	ScoreDocument<GPT>,
	"comment" | "game" | "importType" | "scoreMeta" | "service" | "timeAchieved"
> & {
	scoreData: ProvidedMetrics[GPT] & {
		optional: ExtractedOptionalMetrics[GPT];
		judgements: Partial<Record<Judgements[GPT], integer | null>>;
	};
};

export type ScorePlaytypeMap = Partial<Record<Playtype, Array<ScoreDocument>>>;
export type ChartIDPlaytypeMap = Partial<Record<Playtype, Set<string>>>;
