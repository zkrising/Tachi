import {
	APIPermissions,
	ChallengeSubscriptionDocument,
	ChartDocument,
	ClassAchievementDocument,
	FolderDocument,
	GamePTConfig,
	GoalDocument,
	GoalSubscriptionDocument,
	GPTString,
	GPTStringToGame,
	ImportDocument,
	ImportTrackerFailed,
	integer,
	PBScoreDocument,
	UserDocument,
	ScoreDocument,
	SessionDocument,
	ShowcaseStatChart,
	ShowcaseStatFolder,
	SongDocument,
	TableDocument,
	UserGameStats,
	UserGameStatsSnapshotDocument,
	QuestDocument,
	QuestSubscriptionDocument,
	QuestlineDocument,
	SessionScoreInfo,
	ProfileRatingAlgorithms,
} from "tachi-common";

export interface UGPTStatsReturn<GPT extends GPTString = GPTString> {
	gameStats: UserGameStats;
	firstScore: ScoreDocument<GPT>;
	mostRecentScore: ScoreDocument<GPT>;
	totalScores: number;
	rankingData: Record<
		ProfileRatingAlgorithms[GPT],
		{
			ranking: integer;
			outOf: integer;
		}
	>;
	playtime: number;
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
			result: { value: number | null };
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

export type UGPTHistory = Omit<UserGameStatsSnapshotDocument, "userID" | "game" | "playtype">[];

export interface SessionReturns<GPT extends GPTString = GPTString> {
	session: SessionDocument;
	scores: ScoreDocument[];
	scoreInfo: Array<SessionScoreInfo>;
	songs: SongDocument<GPTStringToGame[GPT]>[];
	charts: ChartDocument<GPT>[];
	user: UserDocument;
}

export interface UGPTChartPBComposition<GPT extends GPTString = GPTString> {
	scores: ScoreDocument<GPT>[];
	chart: ChartDocument<GPT>;
	pb: PBScoreDocument<GPT>;
}

export type UGSWithRankingData<GPT extends GPTString = GPTString> = UserGameStats & {
	__rankingData: Record<ProfileRatingAlgorithms[GPT], { outOf: number; ranking: number }>;
};

export interface SongChartsSearch<GPT extends GPTString = GPTString> {
	songs: SongDocument<GPTStringToGame[GPT]>[];
	charts: ChartDocument<GPT>[];
}

export interface FolderStatsInfo {
	stats: Record<string, Record<string, integer>>;
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

export interface UGPTFolderReturns<GPT extends GPTString = GPTString> {
	folder: FolderDocument;
	songs: SongDocument<GPTStringToGame[GPT]>[];
	charts: ChartDocument<GPT>[];
	pbs: PBScoreDocument<GPT>[];
}

export interface GPTFolderReturns<GPT extends GPTString = GPTString> {
	folder: FolderDocument;
	songs: SongDocument<GPTStringToGame[GPT]>[];
	charts: ChartDocument<GPT>[];
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

export interface SongsReturn<GPT extends GPTString = GPTString> {
	song: SongDocument<GPTStringToGame[GPT]>;
	charts: ChartDocument<GPT>[];
}

export interface ChartPBLeaderboardReturn<GPT extends GPTString = GPTString> {
	users: UserDocument[];
	pbs: PBScoreDocument<GPT>[];
}

export interface UGPTChartLeaderboardAdjacent<GPT extends GPTString = GPTString> {
	users: UserDocument[];
	pb: PBScoreDocument<GPT>;
	adjacentAbove: PBScoreDocument<GPT>[];
	adjacentBelow: PBScoreDocument<GPT>[];
}

export interface ScoreLeaderboardReturns<GPT extends GPTString = GPTString> {
	users: UserDocument[];
	songs: SongDocument<GPTStringToGame[GPT]>[];
	charts: ChartDocument<GPT>[];
	pbs: PBScoreDocument<GPT>[];
}

export interface UserLeaderboardReturns {
	users: UserDocument[];
	gameStats: UserGameStats[];
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

	goals: Array<GoalDocument>;
	quests: Array<QuestDocument>;

	// recently achieved goal/quest subs
	goalSubs: Array<GoalSubscriptionDocument>;
	questSubs: Array<QuestSubscriptionDocument>;

	users: Array<UserDocument>;
}

export type RecordActivityReturn = Partial<Record<GPTString, ActivityReturn>>;

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

export interface QuestlineReturn {
	questline: QuestlineDocument;
	quests: Array<QuestDocument>;
	goals: Array<GoalDocument>;
}

export interface QuestReturn {
	quest: QuestDocument;
	questSubs: Array<QuestSubscriptionDocument>;
	users: Array<UserDocument>;
	goals: Array<GoalDocument>;
	parentQuestlines: Array<QuestlineDocument>;
}

export type SessionFolderRaises = {
	folder: FolderDocument;
	raisedCharts: Array<string>; // Array<chartID>;
	previousCount: integer; // how many AAAs/HARD CLEARs/whatevers was on this
	// folder before this session?
	totalCharts: integer;
	type: string;
	value: string;
};
