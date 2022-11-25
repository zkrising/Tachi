import {
	APIPermissions,
	ChallengeSubscriptionDocument,
	ChartDocument,
	ClassAchievementDocument,
	FolderDocument,
	GamePTConfig,
	GoalDocument,
	GoalSubscriptionDocument,
	Grades,
	IDStrings,
	IDStringToGame,
	ImportDocument,
	ImportTrackerFailed,
	integer,
	Lamps,
	PBScoreDocument,
	UserDocument,
	ScoreDocument,
	SessionDocument,
	ShowcaseStatChart,
	ShowcaseStatFolder,
	SongDocument,
	TableDocument,
	UGSRatingsLookup,
	UserGameStats,
	UserGameStatsSnapshot,
	QuestDocument,
	QuestSubscriptionDocument,
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
	users: UserDocument[];
	thisUsersStats: UserGameStats;
	thisUsersRanking: {
		ranking: integer;
		outOf: integer;
	};
}

export interface GPTLeaderboard {
	gameStats: UserGameStats[];
	users: UserDocument[];
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
			related: { folder: FolderDocument };
	  };

export type UGPTHistory = Omit<UserGameStatsSnapshot, "userID" | "game" | "playtype">[];

export interface SessionReturns<I extends IDStrings = IDStrings> {
	session: SessionDocument;
	scores: ScoreDocument[];
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	user: UserDocument;
}

export interface UGPTChartPBComposition<I extends IDStrings = IDStrings> {
	scores: ScoreDocument<I>[];
	chart: ChartDocument<I>;
	pb: PBScoreDocument<I>;
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

export interface GPTFolderReturns<I extends IDStrings = IDStrings> {
	folder: FolderDocument;
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
}

export interface GPTStatsReturn {
	config: GamePTConfig;
	playerCount: integer;
	chartCount: integer;
	scoreCount: integer;
}

export interface RecentClassesReturn {
	classes: ClassAchievementDocument[];
	users: UserDocument[];
}

export interface SongsReturn<I extends IDStrings = IDStrings> {
	song: SongDocument<IDStringToGame[I]>;
	charts: ChartDocument<I>[];
}

export interface ChartPBLeaderboardReturn<I extends IDStrings = IDStrings> {
	users: UserDocument[];
	pbs: PBScoreDocument<I>[];
}

export interface UGPTChartLeaderboardAdjacent<I extends IDStrings = IDStrings> {
	users: UserDocument[];
	pb: PBScoreDocument<I>;
	adjacentAbove: PBScoreDocument<I>[];
	adjacentBelow: PBScoreDocument<I>[];
}

export interface ScoreLeaderboardReturns<I extends IDStrings = IDStrings> {
	users: UserDocument[];
	songs: SongDocument<IDStringToGame[I]>[];
	charts: ChartDocument<I>[];
	pbs: PBScoreDocument<I>[];
}

export interface UserLeaderboardReturns<I extends IDStrings = IDStrings> {
	users: UserDocument[];
	gameStats: UserGameStats<I>[];
}

export interface UserRecentSummary {
	recentPlaycount: integer;
	recentSessions: SessionDocument[];
	recentFolders: FolderDocument[];
	recentFolderStats: FolderStatsInfo[];
	recentGoals: GoalDocument[];
	recentImprovedGoals: GoalSubscriptionDocument[];
	recentAchievedGoals: GoalSubscriptionDocument[];
}

export interface ServerStatus {
	serverTime: number;
	startTime: number;
	version: string;
	whoami: integer | null;
	permissions: APIPermissions[];
}

export interface ChallengeSubsReturn {
	rivals: Array<UserDocument>;
	pbs: Array<PBScoreDocument>;
	challengeSubs: Array<ChallengeSubscriptionDocument>;
	songs: Array<SongDocument>;
	charts: Array<ChartDocument>;
}

export interface ChartRivalsReturn {
	rivals: Array<UserDocument>;
	pbs: Array<PBScoreDocument>;
}

export interface ImportIDReturn {
	scores: ScoreDocument[];
	songs: SongDocument[];
	charts: ChartDocument[];
	sessions: SessionDocument[];
	import: ImportDocument;
	user: UserDocument;
}

export interface FailedImportsReturn {
	failedImports: Array<ImportTrackerFailed>;
	users: Array<UserDocument>;
}

export interface ImportsReturn {
	imports: Array<ImportDocument>;
	users: Array<UserDocument>;
}

export interface ActivityReturn {
	recentSessions: Array<SessionDocument>;

	songs: Array<SongDocument>;
	charts: Array<ChartDocument>;
	recentlyHighlightedScores: Array<ScoreDocument>;
	achievedClasses: Array<ClassAchievementDocument>;

	users: Array<UserDocument>;
}

export type RecordActivityReturn = Partial<Record<IDStrings, ActivityReturn>>;

export interface GoalsOnChartReturn {
	goals: Array<GoalDocument>;
	goalSubs: Array<GoalSubscriptionDocument>;
	quests: Array<QuestDocument>;
	questSubs: Array<QuestSubscriptionDocument>;
}

export type GoalsOnFolderReturn = GoalsOnChartReturn;
export type AllUGPTGoalsReturn = GoalsOnChartReturn;

export interface RecentlyAchievedOrRaisedTargets {
	goals: Array<GoalDocument>;
	quests: Array<QuestDocument>;
	goalSubs: Array<GoalSubscriptionDocument>;
	questSubs: Array<QuestSubscriptionDocument>;
	user: UserDocument;
}

export interface GPTQuestsReturn {
	goals: Array<GoalDocument>;
	quests: Array<QuestDocument>;
}

export interface UGPTTargetSubs {
	goalSubs: Array<GoalSubscriptionDocument>;
	questSubs: Array<QuestSubscriptionDocument>;
}
