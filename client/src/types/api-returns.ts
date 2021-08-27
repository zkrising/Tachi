import {
	FolderDocument,
	IDStrings,
	integer,
	PublicUserDocument,
	ScoreDocument,
	UserGameStats,
	ShowcaseStatChart,
	ShowcaseStatFolder,
	UserGameStatsSnapshot,
	SessionDocument,
	IDStringToGame,
	ChartDocument,
	SongDocument,
	PBScoreDocument,
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
				song: SongDocument;
				chart: ChartDocument;
			};
	  }
	| {
			stat: ShowcaseStatFolder;
			value: { value: integer; outOf: integer };
			related: { folders: FolderDocument[] };
	  };

export type UGPTHistory = Omit<UserGameStatsSnapshot, "userID" | "game" | "playtype">[];

export interface SessionReturns<I extends IDStrings = IDStrings> {
	session: SessionDocument;
	scores: ScoreDocument[];
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	user: PublicUserDocument;
}

export interface UGPTChartPBComposition<I extends IDStrings = IDStrings> {
	scores: ScoreDocument<I>[];
	chart: ChartDocument<I>;
	pb: PBScoreDocument<I>;
}

export interface SpecificSessionReturns<I extends IDStrings = IDStrings> {
	session: SessionDocument<I>;
	scores: ScoreDocument<I>[];
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	user: PublicUserDocument;
}

export type UGSWithRankingData<I extends IDStrings = IDStrings> = UserGameStats<I> & {
	__rankingData: { outOf: number; ranking: number };
};
