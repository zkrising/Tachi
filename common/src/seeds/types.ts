import type {
	Game,
	ChartDocument,
	GameToIDStrings,
	SongDocument,
	BMSCourseDocument,
	FolderDocument,
	GoalDocument,
	QuestlineDocument,
	QuestDocument,
	TableDocument,
} from "../types";

// lazy, but kinda cool macros.
// note that TS won't let you do this multiple times within an object
// so, we have to join them ourselves. Ah well, not that bad.
type ChartDBSeeds = {
	[G in Game as `charts-${G}.json`]: Array<ChartDocument<GameToIDStrings[G]>>;
};

type SongDBSeeds = {
	[G in Game as `songs-${G}.json`]: Array<SongDocument<G>>;
};

interface OtherDBSeeds {
	"bms-course-lookup.json": Array<BMSCourseDocument>;
	"folders.json": Array<FolderDocument>;
	"goals.json": Array<GoalDocument>;
	"questlines.json": Array<QuestlineDocument>;
	"quests.json": Array<QuestDocument>;
	"tables.json": Array<TableDocument>;
}

export type AllDatabaseSeeds = ChartDBSeeds & OtherDBSeeds & SongDBSeeds;

// Nifty trick to enforce that we always specify all database seeds :)
const CURRENT_DATABASE_SEEDS: Record<keyof AllDatabaseSeeds, true> = {
	"bms-course-lookup.json": true,
	"charts-bms.json": true,
	"charts-chunithm.json": true,
	"charts-gitadora.json": true,
	"charts-iidx.json": true,
	"charts-itg.json": true,
	"charts-jubeat.json": true,
	"charts-maimai.json": true,
	"charts-museca.json": true,
	"charts-pms.json": true,
	"charts-popn.json": true,
	"charts-sdvx.json": true,
	"charts-usc.json": true,
	"charts-wacca.json": true,
	"folders.json": true,
	"goals.json": true,
	"questlines.json": true,
	"quests.json": true,
	"songs-bms.json": true,
	"songs-chunithm.json": true,
	"songs-gitadora.json": true,
	"songs-iidx.json": true,
	"songs-itg.json": true,
	"songs-jubeat.json": true,
	"songs-maimai.json": true,
	"songs-museca.json": true,
	"songs-pms.json": true,
	"songs-popn.json": true,
	"songs-sdvx.json": true,
	"songs-usc.json": true,
	"songs-wacca.json": true,
	"tables.json": true,
};

export const DatabaseSeedNames = Object.keys(CURRENT_DATABASE_SEEDS) as Array<
	keyof AllDatabaseSeeds
>;
