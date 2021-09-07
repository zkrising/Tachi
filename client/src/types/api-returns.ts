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
	UGSRatingsLookup,
} from "tachi-common";

export interface UGPTStatsReturn<I extends IDStrings = IDStrings> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument<I>;
	mostRecentScore: ScoreDocument<I>;
	totalScores: number;
	rankingData: Record<
		UGSRatingsLookup[I],
		{
			ranking: integer;
			outOf: integer;
		}
	>;
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
			result: { value: number };
			related: {
				song: SongDocument;
				chart: ChartDocument;
			};
	  }
	| {
			stat: ShowcaseStatFolder;
			result: { value: integer; outOf: integer };
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
	__rankingData: Record<UGSRatingsLookup[I], { outOf: number; ranking: number }>;
};

export interface SongChartsSearch<I extends IDStrings = IDStrings> {
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
}
