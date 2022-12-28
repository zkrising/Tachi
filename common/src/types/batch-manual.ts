import type { GameClassSets } from "../config/game-classes";
import type {
	IDStrings,
	Lamps,
	JudgementLookup,
	integer,
	HitMetaLookup,
	ScoreMetaLookup,
	Difficulties,
	IDStringToGame,
	IDStringToPlaytype,
	GPTSupportedVersions,
} from "../types";

// These MatchTypes don't need `difficulty` set in the batch manual.
type MatchTypesNoDifficulty = "bmsChartHash" | "itgChartHash" | "popnChartHash" | "uscChartHash";

// These MatchTypes need `difficulty` set in the batch manual.
type MatchTypesWithDifficulty = "inGameID" | "sdvxInGameID" | "songTitle" | "tachiSongID";

export type MatchTypes = MatchTypesNoDifficulty | MatchTypesWithDifficulty;

export type BatchManualScore<I extends IDStrings = IDStrings> = {
	score: number;
	lamp: Lamps[I];
	percent?: number;
	identifier: string;
	comment?: string | null;
	judgements?: Record<JudgementLookup[I], integer>;
	timeAchieved?: number | null;
	hitMeta?: Partial<HitMetaLookup[I]>;
	scoreMeta?: Partial<ScoreMetaLookup[I]>;
} & (
	| {
			matchType: MatchTypesNoDifficulty;
			difficulty?: undefined; // hack to stop ts from screaming when this is accessed sometimes
	  }
	| {
			matchType: MatchTypesWithDifficulty;
			difficulty: Difficulties[I];
	  }
);

export interface BatchManual<I extends IDStrings = IDStrings> {
	meta: {
		game: IDStringToGame[I];
		playtype: IDStringToPlaytype[I];
		service: string;
		version?: GPTSupportedVersions[I];
	};
	scores: Array<BatchManualScore<I>>;
	classes?: Record<GameClassSets[I], string> | null;
}
