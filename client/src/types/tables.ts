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

export type PBDataset<GPT extends GPTString = GPTString> = (PBScoreDocument<GPT> & {
	__related: {
		chart: ChartDocument<GPT>;
		song: SongDocument<GPTStringToGame[GPT]>;
		index: integer;
		user?: UserDocument;
	};
	__playcount?: integer;
})[];

export type ScoreDataset<GPT extends GPTString = GPTString> = (ScoreDocument<GPT> & {
	__related: {
		chart: ChartDocument<GPT>;
		song: SongDocument<GPTStringToGame[GPT]>;
		index: integer;
		user: UserDocument;
	};
})[];

export type FolderDataset<GPT extends GPTString = GPTString> = (ChartDocument<GPT> & {
	__related: {
		pb: PBScoreDocument<GPT> | null;
		song: SongDocument<GPTStringToGame[GPT]>;
		user: UserDocument;
	};
})[];

export type ChartLeaderboardDataset<GPT extends GPTString = GPTString> = (PBScoreDocument<GPT> & {
	__related: {
		user: UserDocument;
	};
})[];

export type UGSDataset<GPT extends GPTString = GPTString> = (UserGameStats<GPT> & {
	__related: {
		user: UserDocument;
		index: integer;
	};
})[];

export type RivalChartDataset<GPT extends GPTString = GPTString> = (UserDocument & {
	__related: {
		pb: PBScoreDocument<GPT> | null;
		index: number;
	};
})[];

export type ComparePBsDataset<GPT extends GPTString = GPTString> = Array<{
	base: PBScoreDocument<GPT> | null;
	compare: PBScoreDocument<GPT> | null;
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
