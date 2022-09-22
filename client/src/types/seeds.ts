import {
	BMSCourseDocument,
	ChartDocument,
	FolderDocument,
	Game,
	GameToIDStrings,
	GoalDocument,
	GoalDocumentAny,
	GoalDocumentFolder,
	GoalDocumentMulti,
	GoalDocumentSingle,
	IDStrings,
	IDStringToGame,
	MilestoneDocument,
	MilestoneSetDocument,
	SongDocument,
	TableDocument,
} from "tachi-common";

// To render seeds with their tables properly, we need to conjoin our data with
// any other relevant info. These are used for rendering tables.
export type BMSCourseWithRelated = BMSCourseDocument & {
	__related: {
		/**
		 * Entry data is just a string in the case where the chart doesn't exist in
		 * the seeds. This string is just the MD5 of the chart that was expected.
		 */
		entries: Array<
			| {
					chart: ChartDocument<"bms:7K" | "bms:14K">;
					song: SongDocument<"bms">;
			  }
			| string
		>;
	};
};

export type TableWithRelated = TableDocument & {
	__related: {
		folders: Array<FolderDocument>;
	};
};

export type GoalWithRelated =
	| (GoalDocumentSingle & {
			__related: {
				chart: ChartDocument;
				song: SongDocument;
			};
	  })
	| (GoalDocumentMulti & {
			__related: {
				charts: Array<ChartDocument>;
				songs: Array<SongDocument>;
			};
	  })
	| (GoalDocumentFolder & {
			__related: {
				folder: FolderDocument;
			};
	  })
	| GoalDocumentAny;

export type MilestoneSetWithRelated = MilestoneSetDocument & {
	__related: {
		milestones: Array<MilestoneDocument>;
	};
};

export type MilestoneWithRelated = MilestoneDocument & {
	__related: {
		goals: Array<GoalDocument>;
	};
};

export type ChartWithRelated<T extends IDStrings> = ChartDocument<T> & {
	__related: {
		song: SongDocument<IDStringToGame[T]>;
	};
};

type SongSeedsWithRelated = {
	[G in Game as `songs-${G}.json`]: Array<SongDocument<G>>;
};

type ChartSeedsWithRelated = {
	[G in Game as `charts-${G}.json`]: Array<ChartWithRelated<GameToIDStrings[G]>>;
};

/**
 * A lookup type for turning database seeds into their corresponding datasets.
 * This involves things like adding __related song and chart info, which is useful
 * for rendering.
 */
export type DatabaseSeedsWithRelated = {
	"bms-course-lookup.json": Array<BMSCourseWithRelated>;

	// intentional: folders don't need to be joined with anything.
	"folders.json": Array<FolderDocument>;

	"tables.json": Array<TableWithRelated>;
	"goals.json": Array<GoalWithRelated>;
	"milestone-sets.json": Array<MilestoneSetWithRelated>;
	"milestones.json": Array<MilestoneWithRelated>;
} & SongSeedsWithRelated &
	ChartSeedsWithRelated;
