import type { integer } from "../types";
import type {
	ConfOptionalMetrics,
	Versions,
	Difficulties,
	ExtractedClasses,
	GPTString,
	GPTStringToGame,
	GPTStringToPlaytype,
	Judgements,
	ConfProvidedMetrics,
	ScoreMeta,
} from "./game-config";
import type { ExtractMetrics } from "./metrics";
import type { AllFieldsNullableOptional } from "./utils";

// These MatchTypes don't need `difficulty` set in the batch manual.
type MatchTypesNoDifficulty = "bmsChartHash" | "itgChartHash" | "popnChartHash" | "uscChartHash";

// These MatchTypes need `difficulty` set in the batch manual.
type MatchTypesWithDifficulty =
	| "ddrSongHash"
	| "inGameID"
	| "inGameStrID"
	| "sdvxInGameID"
	| "songTitle"
	| "tachiSongID";

export type MatchTypes = MatchTypesNoDifficulty | MatchTypesWithDifficulty;

export type BatchManualScore<GPT extends GPTString = GPTString> = ExtractMetrics<
	ConfProvidedMetrics[GPT]
> & {
	identifier: string;
	comment?: string | null;
	judgements?: Record<Judgements[GPT], integer>;
	timeAchieved?: number | null;
	artist?: string | null;
	optional?: AllFieldsNullableOptional<ExtractMetrics<ConfOptionalMetrics[GPT]>>;

	/**
	 * @deprecated Use `optional` instead.
	 */
	hitMeta?: AllFieldsNullableOptional<ExtractMetrics<ConfOptionalMetrics[GPT]>>;
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
		version?: Versions[GPT];
	};
	scores: Array<BatchManualScore<GPT>>;
	classes?: ExtractedClasses[GPT] | null;
}
