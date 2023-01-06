import {
	ChartDocument,
	GPTString,
	IDStringToGame,
	ImportDocument,
	ImportTrackerFailed,
	integer,
	PBScoreDocument,
	UserDocument,
	ScoreDocument,
	SongDocument,
	UserGameStats,
	GoalSubscriptionDocument,
	GoalDocument,
	QuestDocument,
} from "tachi-common";

export type PBDataset<I extends GPTString = GPTString> = (PBScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user?: UserDocument;
	};
	__playcount?: integer;
})[];

export type ScoreDataset<I extends GPTString = GPTString> = (ScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<IDStringToGame[I]>;
		index: integer;
		user: UserDocument;
	};
})[];

export type FolderDataset<I extends GPTString = GPTString> = (ChartDocument<I> & {
	__related: {
		pb: PBScoreDocument<I> | null;
		song: SongDocument<IDStringToGame[I]>;
		user: UserDocument;
	};
})[];

export type ChartLeaderboardDataset<I extends GPTString = GPTString> = (PBScoreDocument<I> & {
	__related: {
		user: UserDocument;
	};
})[];

export type UGSDataset<I extends GPTString = GPTString> = (UserGameStats<I> & {
	__related: {
		user: UserDocument;
		index: integer;
	};
})[];

export type RivalChartDataset<I extends GPTString = GPTString> = (UserDocument & {
	__related: {
		pb: PBScoreDocument<I> | null;
		index: number;
	};
})[];

export type ComparePBsDataset<I extends GPTString = GPTString> = Array<{
	base: PBScoreDocument<I> | null;
	compare: PBScoreDocument<I> | null;
	chart: ChartDocument;
	song: SongDocument;
}>;

export type ImportDataset = Array<
	ImportDocument & {
		__related: {
			user: UserDocument;
		};
	}
>;

export type FailedImportDataset = Array<
	ImportTrackerFailed & {
		__related: {
			user: UserDocument;
		};
	}
>;

export type GoalSubDataset = (GoalSubscriptionDocument & {
	__related: {
		user: UserDocument;
		goal: GoalDocument;
		parentQuests: Array<QuestDocument>;
	};
})[];
