import {
	IDStrings,
	PBScoreDocument,
	ChartDocument,
	SongDocument,
	IDStringToGame,
	integer,
} from "tachi-common";

export type PBDataset<I extends IDStrings> = (PBScoreDocument<I> & {
	__related: { chart: ChartDocument<I>; song: SongDocument<IDStringToGame[I]>; index: integer };
})[];
