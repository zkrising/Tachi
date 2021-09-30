import {
	ChartDocument,
	ClassAchievementDocument,
	ClassDelta,
	FolderDocument,
	GamePTConfig,
	Grades,
	IDStrings,
	IDStringToGame,
	integer,
	Lamps,
	PBScoreDocument,
	PublicUserDocument,
	ScoreDocument,
	SessionDocument,
	ShowcaseStatChart,
	ShowcaseStatFolder,
	SongDocument,
	TableDocument,
	UGSRatingsLookup,
	UserGameStats,
	UserGameStatsSnapshot,
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

export interface FolderStatsInfo<I extends IDStrings = IDStrings> {
	grades: Record<Grades[I], integer>;
	lamps: Record<Lamps[I], integer>;
	folderID: string;
	chartCount: integer;
}

export interface UGPTFolderSearch {
	folders: FolderDocument[];
	stats: FolderStatsInfo[];
}

export interface UGPTTableReturns {
	folders: FolderDocument[];
	stats: FolderStatsInfo[];
	table: TableDocument;
}

export interface UGPTFolderReturns<I extends IDStrings = IDStrings> {
	folder: FolderDocument;
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	pbs: PBScoreDocument<I>[];
}

export interface GPTStatsReturn {
	config: GamePTConfig;
	playerCount: integer;
	chartCount: integer;
	scoreCount: integer;
}

export interface RecentClassesReturn {
	classes: ClassAchievementDocument[];
	users: PublicUserDocument[];
}

export interface SongsReturn<I extends IDStrings = IDStrings> {
	song: SongDocument<IDStringToGame[I]>;
	charts: ChartDocument<I>[];
}

export interface ChartPBLeaderboardReturn<I extends IDStrings = IDStrings> {
	users: PublicUserDocument[];
	pbs: PBScoreDocument<I>[];
}

export interface UGPTChartLeaderboardAdjacent<I extends IDStrings = IDStrings> {
	users: PublicUserDocument[];
	pb: PBScoreDocument<I>;
	adjacentAbove: PBScoreDocument<I>[];
	adjacentBelow: PBScoreDocument<I>[];
}

export interface ScoreLeaderboardReturns<I extends IDStrings = IDStrings> {
	users: PublicUserDocument[];
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	pbs: PBScoreDocument<I>[];
}

export interface UserLeaderboardReturns<I extends IDStrings = IDStrings> {
	users: PublicUserDocument[];
	gameStats: UserGameStats<I>[];
}
