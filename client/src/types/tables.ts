import {
	ChartDocument,
	GPTString,
	GPTStringToGame,
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

export type PBDataset<GPT extends GPTString = GPTString> = (PBScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<GPTStringToGame[I]>;
		index: integer;
		user?: UserDocument;
	};
	__playcount?: integer;
})[];

export type ScoreDataset<GPT extends GPTString = GPTString> = (ScoreDocument<I> & {
	__related: {
		chart: ChartDocument<I>;
		song: SongDocument<GPTStringToGame[I]>;
		index: integer;
		user: UserDocument;
	};
})[];

export type FolderDataset<GPT extends GPTString = GPTString> = (ChartDocument<I> & {
	__related: {
		pb: PBScoreDocument<I> | null;
		song: SongDocument<GPTStringToGame[I]>;
		user: UserDocument;
	};
})[];

export type ChartLeaderboardDataset<GPT extends GPTString = GPTString> = (PBScoreDocument<I> & {
	__related: {
		user: UserDocument;
	};
})[];

export type UGSDataset<GPT extends GPTString = GPTString> = (UserGameStats<I> & {
	__related: {
		user: UserDocument;
		index: integer;
	};
})[];

export type RivalChartDataset<GPT extends GPTString = GPTString> = (UserDocument & {
	__related: {
		pb: PBScoreDocument<I> | null;
		index: number;
	};
})[];

export type ComparePBsDataset<GPT extends GPTString = GPTString> = Array<{
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
