import {
	ChartDocument,
	ImportDocument,
	PublicUserDocument,
	ScoreDocument,
	SessionDocument,
	SongDocument,
} from "tachi-common";

export type ImportInformation = {
	scores: ScoreDocument[];
	songs: SongDocument[];
	charts: ChartDocument[];
	sessions: SessionDocument[];
	import: ImportDocument;
	user: PublicUserDocument;
};

export type ImportStates =
	| { state: "not_started" }
	| { state: "waiting_init" }
	| { state: "waiting_processing"; progressInfo: { description: string } }
	| {
			state: "done";
			import: ImportDocument;
			details: null | {
				import: ImportDocument;
				scores: ScoreDocument[];
				songs: SongDocument[];
				charts: ChartDocument[];
				sessions: SessionDocument[];
				user: PublicUserDocument;
			};
	  }
	| { state: "failed"; error: string };

export const NotStartedState: ImportStates = { state: "not_started" };
