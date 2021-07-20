import { IDStrings, ScoreDocument, UserGameStats } from "tachi-common";

export interface UGPTStatsReturn<I extends IDStrings = IDStrings> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument<I>;
	mostRecentScore: ScoreDocument<I>;
	totalScores: number;
	rankingData: {
		ranking: number;
		outOf: number;
	};
}
