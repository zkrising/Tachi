import type { integer } from "../types";
import type {
	AdditionalMetrics,
	ChartSets,
	Difficulties,
	ExtractedClasses,
	GPTString,
	GPTStringToGame,
	GPTStringToPlaytype,
	Judgements,
	ProvidedMetrics,
	ScoreMeta,
} from "./game-config";
import type { ExtractMetrics } from "./metrics";

// These MatchTypes don't need `difficulty` set in the batch manual.
type MatchTypesNoDifficulty = "bmsChartHash" | "itgChartHash" | "popnChartHash" | "uscChartHash";

// These MatchTypes need `difficulty` set in the batch manual.
type MatchTypesWithDifficulty = "inGameID" | "sdvxInGameID" | "songTitle" | "tachiSongID";

export type MatchTypes = MatchTypesNoDifficulty | MatchTypesWithDifficulty;

export type BatchManualScore<GPT extends GPTString = GPTString> = ExtractMetrics<
	ProvidedMetrics[GPT]
> & {
	identifier: string;
	comment?: string | null;
	judgements?: Record<Judgements[GPT], integer>;
	timeAchieved?: number | null;
	additionalMetrics?: Partial<ExtractMetrics<AdditionalMetrics[GPT]>>;
	scoreMeta?: Partial<ScoreMeta[GPT]>;
} & (
		| {
				matchType: MatchTypesNoDifficulty;
				difficulty?: undefined; // hack to stop ts from screaming when this is accessed sometimes
		  }
		| {
				matchType: MatchTypesWithDifficulty;
				difficulty: Difficulties[GPT];
		  }
	);

export interface BatchManual<GPT extends GPTString = GPTString> {
	meta: {
		game: GPTStringToGame[GPT];
		playtype: GPTStringToPlaytype[GPT];
		service: string;

		chartSet?: ChartSets[GPT];

		/**
		 * @deprecated Use `meta.chartSet` instead. This is an alias for `meta.chartSet`.
		 */
		version?: ChartSets[GPT];
	};
	scores: Array<BatchManualScore<GPT>>;
	classes?: ExtractedClasses[GPT] | null;
}
