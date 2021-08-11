import {
	CounterDocument,
	FolderDocument,
	GoalDocument,
	IIDXBPIData,
	ImportDocument,
	TierlistParent,
	InviteCodeDocument,
	APITokenDocument,
	TierlistDataDocument,
	MilestoneDocument,
	FolderChartLookup,
	ImportTimingsDocument,
	PrivateUserDocument,
	ScoreDocument,
	KaiAuthDocument,
	UserGameStatsSnapshot,
	SessionDocument,
	AnySongDocument,
	AnyChartDocument,
	UserGameStats,
	TableDocument,
	UserGoalDocument,
	PBScoreDocument,
	UserMilestoneDocument,
	BMSCourseDocument,
	ImportLockDocument,
	UGPTSettings,
	SessionViewDocument,
	ARCSavedProfileDocument,
} from "tachi-common";
import monk, { TMiddleware } from "monk";
import CreateLogCtx from "lib/logger/logger";
import { OrphanScoreDocument } from "lib/score-import/import-types/common/types";
import { GetMilisecondsSince } from "utils/misc";
import { ServerConfig } from "lib/setup/config";

const logger = CreateLogCtx(__filename);

let dbName = ServerConfig.MONGO_DATABASE_NAME;

/* istanbul ignore next */
if (process.env.NODE_ENV === "test") {
	dbName = `testingdb`;
}

let dbtime: bigint;
/* istanbul ignore next */
if (process.env.NODE_ENV !== "test") {
	logger.info(`Connecting to database ${ServerConfig.MONGO_CONNECTION_URL}/${dbName}...`);
	dbtime = process.hrtime.bigint();
}

export const monkDB = monk(`${ServerConfig.MONGO_CONNECTION_URL}/${dbName}`);

/* istanbul ignore next */
monkDB
	.then(() => {
		if (process.env.NODE_ENV !== "test") {
			logger.info(`Database connection successful: took ${GetMilisecondsSince(dbtime!)}ms`);
		}
	})
	.catch((err) => {
		logger.crit(err);
		process.exit(1);
	});

const RemoveIDMiddleware: TMiddleware =
	() =>
	(next) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	(args: any, method) => {
		if ((method === "find" || method === "findOne") && !args.options.projectID) {
			if (args.options.projection) {
				args.options.projection._id = 0;
			} else {
				args.options.projection = { _id: 0 };
			}
		}

		return next(args, method);
	};

monkDB.addMiddleware(RemoveIDMiddleware);

export async function CloseMongoConnection() {
	await monkDB.close();
}

const songs = {
	bms: monkDB.get<AnySongDocument>(`songs-bms`),
	chunithm: monkDB.get<AnySongDocument>(`songs-chunithm`),
	ddr: monkDB.get<AnySongDocument>(`songs-ddr`),
	gitadora: monkDB.get<AnySongDocument>(`songs-gitadora`),
	iidx: monkDB.get<AnySongDocument>(`songs-iidx`),
	jubeat: monkDB.get<AnySongDocument>(`songs-jubeat`),
	maimai: monkDB.get<AnySongDocument>(`songs-maimai`),
	museca: monkDB.get<AnySongDocument>(`songs-museca`),
	popn: monkDB.get<AnySongDocument>(`songs-popn`),
	sdvx: monkDB.get<AnySongDocument>(`songs-sdvx`),
	usc: monkDB.get<AnySongDocument>(`songs-usc`),
};

const charts = {
	bms: monkDB.get<AnyChartDocument>(`charts-bms`),
	chunithm: monkDB.get<AnyChartDocument>(`charts-chunithm`),
	ddr: monkDB.get<AnyChartDocument>(`charts-ddr`),
	gitadora: monkDB.get<AnyChartDocument>(`charts-gitadora`),
	iidx: monkDB.get<AnyChartDocument>(`charts-iidx`),
	jubeat: monkDB.get<AnyChartDocument>(`charts-jubeat`),
	maimai: monkDB.get<AnyChartDocument>(`charts-maimai`),
	museca: monkDB.get<AnyChartDocument>(`charts-museca`),
	popn: monkDB.get<AnyChartDocument>(`charts-popn`),
	sdvx: monkDB.get<AnyChartDocument>(`charts-sdvx`),
	usc: monkDB.get<AnyChartDocument>(`charts-usc`),
};

const db = {
	// i have to handwrite this out for TS... :(
	// dont worry, it was all macro'd
	songs,
	charts,
	scores: monkDB.get<ScoreDocument>("scores"),
	tierlists: monkDB.get<TierlistParent>("tierlists"),
	"tierlist-data": monkDB.get<TierlistDataDocument<never>>("tierlist-data"),
	"personal-bests": monkDB.get<PBScoreDocument>("personal-bests"),
	folders: monkDB.get<FolderDocument>("folders"),
	"folder-chart-lookup": monkDB.get<FolderChartLookup>("folder-chart-lookup"),
	goals: monkDB.get<GoalDocument>("goals"),
	"user-goals": monkDB.get<UserGoalDocument>("user-goals"),
	milestones: monkDB.get<MilestoneDocument>("milestones"),
	"user-milestones": monkDB.get<UserMilestoneDocument>("user-milestones"),
	users: monkDB.get<PrivateUserDocument>("users"),
	imports: monkDB.get<ImportDocument>("imports"),
	"import-timings": monkDB.get<ImportTimingsDocument>("import-timings"),
	sessions: monkDB.get<SessionDocument>("sessions"),
	"iidx-bpi-data": monkDB.get<IIDXBPIData>("iidx-bpi-data"),
	invites: monkDB.get<InviteCodeDocument>("invites"),
	counters: monkDB.get<CounterDocument>("counters"),
	"game-stats": monkDB.get<UserGameStats>("game-stats"),
	"kai-auth-tokens": monkDB.get<KaiAuthDocument>("kai-auth-tokens"),
	"bms-course-lookup": monkDB.get<BMSCourseDocument>("bms-course-lookup"),
	"api-tokens": monkDB.get<APITokenDocument>("api-tokens"),
	"orphan-scores": monkDB.get<OrphanScoreDocument>("orphan-scores"),
	"import-locks": monkDB.get<ImportLockDocument>("import-locks"),
	tables: monkDB.get<TableDocument>("tables"),
	"game-settings": monkDB.get<UGPTSettings>("game-settings"),
	"game-stats-snapshots": monkDB.get<UserGameStatsSnapshot>("game-stats-snapshots"),
	"session-view-cache": monkDB.get<SessionViewDocument>("session-view-cache"),
	"arc-saved-profiles": monkDB.get<ARCSavedProfileDocument>("arc-saved-profiles"),
};

export default db;
