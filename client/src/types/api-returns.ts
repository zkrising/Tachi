import {
	AnyChartDocument,
	AnySongDocument,
	FolderDocument,
	IDStrings,
	integer,
	PublicUserDocument,
	ScoreDocument,
	UserGameStats,
	ShowcaseStatChart,
	ShowcaseStatFolder,
	UserGameStatsSnapshot,
} from "tachi-common";

export interface UGPTStatsReturn<I extends IDStrings = IDStrings> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument<I>;
	mostRecentScore: ScoreDocument<I>;
	totalScores: number;
	rankingData: {
		ranking: integer;
		outOf: integer;
	};
}

export interface UGPTLeaderboardAdjacent {
	above: UserGameStats[];
	below: UserGameStats[];
	users: PublicUserDocument[];
	thisUsersStats: UserGameStats;
	thisUsersRanking: {
		ranking: integer;
		outOf: integer;
	};
}

export interface GPTLeaderboard {
	gameStats: UserGameStats[];
	users: PublicUserDocument[];
}

export type UGPTPreferenceStatsReturn =
	| {
			stat: ShowcaseStatChart;
			value: { value: number };
			related: {
				song: AnySongDocument;
				chart: AnyChartDocument;
			};
	  }
	| {
			stat: ShowcaseStatFolder;
			value: { value: integer; outOf: integer };
			related: { folders: FolderDocument[] };
	  };

export type UGPTHistory = Omit<UserGameStatsSnapshot, "userID" | "game" | "playtype">[];
