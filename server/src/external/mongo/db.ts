import { ONE_MINUTE } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import { OrphanScoreDocument } from "lib/score-import/import-types/common/types";
import { ServerConfig } from "lib/setup/config";
import monk, { TMiddleware } from "monk";
import {
	APITokenDocument,
	ARCSavedProfileDocument,
	BMSCourseDocument,
	ChartDocument,
	ClassAchievementDocument,
	CounterDocument,
	FervidexSettingsDocument,
	FolderChartLookup,
	FolderDocument,
	Game,
	GoalDocument,
	IIDXBPIData,
	ImportDocument,
	ImportLockDocument,
	ImportTimingsDocument,
	integer,
	InviteCodeDocument,
	KaiAuthDocument,
	MilestoneDocument,
	OAuth2ApplicationDocument,
	OrphanChart,
	PBScoreDocument,
	PrivateUserInfoDocument,
	PublicUserDocument,
	ScoreDocument,
	SessionDocument,
	SessionViewDocument,
	SongDocument,
	TableDocument,
	UGPTSettings,
	UserGameStats,
	UserGameStatsSnapshot,
	UserGoalDocument,
	UserMilestoneDocument,
	UserSettings,
} from "tachi-common";
import { GetMilisecondsSince } from "utils/misc";

const logger = CreateLogCtx(__filename);

let dbName = ServerConfig.MONGO_DATABASE_NAME;

/* istanbul ignore next */
if (process.env.NODE_ENV === "test") {
	dbName = `testingdb`;
}

logger.info(`Connecting to database ${ServerConfig.MONGO_CONNECTION_URL}/${dbName}...`);
const dbtime = process.hrtime.bigint();

// By default the connectTimeoutMS is 30 seconds. This has been upped to 2 minutes, due to poor performance
// inside githubs test runners.
export const monkDB = monk(`${ServerConfig.MONGO_CONNECTION_URL}/${dbName}`, {
	serverSelectionTimeoutMS: ONE_MINUTE * 2,
});

/* istanbul ignore next */
monkDB
	.then(() => {
		logger.info(`Database connection successful: took ${GetMilisecondsSince(dbtime)}ms`);
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

// a bug in monks types means that :any has to be used here. Maybe we'll make a PR for this?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StripIDMiddleware: TMiddleware = () => (next) => (args: any, method) => {
	if (method === "insert") {
		if (Array.isArray(args.data)) {
			for (const d of args.data) {
				delete d._id;
			}
		} else {
			delete args.data._id;
		}
	}

	return next(args, method);
};

monkDB.addMiddleware(StripIDMiddleware);
monkDB.addMiddleware(RemoveIDMiddleware);

export async function CloseMongoConnection() {
	await monkDB.close();
}

const songs = {
	bms: monkDB.get<SongDocument>(`songs-bms`),
	chunithm: monkDB.get<SongDocument>(`songs-chunithm`),
	ddr: monkDB.get<SongDocument>(`songs-ddr`),
	gitadora: monkDB.get<SongDocument>(`songs-gitadora`),
	iidx: monkDB.get<SongDocument>(`songs-iidx`),
	jubeat: monkDB.get<SongDocument>(`songs-jubeat`),
	maimai: monkDB.get<SongDocument>(`songs-maimai`),
	museca: monkDB.get<SongDocument>(`songs-museca`),
	popn: monkDB.get<SongDocument>(`songs-popn`),
	sdvx: monkDB.get<SongDocument>(`songs-sdvx`),
	usc: monkDB.get<SongDocument>(`songs-usc`),
};

const charts = {
	bms: monkDB.get<ChartDocument>(`charts-bms`),
	chunithm: monkDB.get<ChartDocument>(`charts-chunithm`),
	ddr: monkDB.get<ChartDocument>(`charts-ddr`),
	gitadora: monkDB.get<ChartDocument>(`charts-gitadora`),
	iidx: monkDB.get<ChartDocument>(`charts-iidx`),
	jubeat: monkDB.get<ChartDocument>(`charts-jubeat`),
	maimai: monkDB.get<ChartDocument>(`charts-maimai`),
	museca: monkDB.get<ChartDocument>(`charts-museca`),
	popn: monkDB.get<ChartDocument>(`charts-popn`),
	sdvx: monkDB.get<ChartDocument>(`charts-sdvx`),
	usc: monkDB.get<ChartDocument>(`charts-usc`),
};

const db = {
	// i have to handwrite this out for TS... :(
	// dont worry, it was all macro'd.
	songs,
	charts,
	scores: monkDB.get<ScoreDocument>("scores"),
	"personal-bests": monkDB.get<PBScoreDocument>("personal-bests"),
	folders: monkDB.get<FolderDocument>("folders"),
	"folder-chart-lookup": monkDB.get<FolderChartLookup>("folder-chart-lookup"),
	goals: monkDB.get<GoalDocument>("goals"),
	"user-goals": monkDB.get<UserGoalDocument>("user-goals"),
	milestones: monkDB.get<MilestoneDocument>("milestones"),
	"user-milestones": monkDB.get<UserMilestoneDocument>("user-milestones"),
	users: monkDB.get<PublicUserDocument>("users"),
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
	"user-settings": monkDB.get<UserSettings>("user-settings"),
	"user-private-information": monkDB.get<PrivateUserInfoDocument>("user-private-information"),
	"oauth2-clients": monkDB.get<OAuth2ApplicationDocument>("oauth2-clients"),
	"oauth2-auth-codes":
		// i've inlined this one because i don't see it appearing anywhere else.
		monkDB.get<{ code: string; userID: integer; createdOn: number }>("oauth2-auth-codes"),
	"fer-settings": monkDB.get<FervidexSettingsDocument>("fer-settings"),
	"orphan-chart-queue": monkDB.get<OrphanChart>("orphan-chart-queue"),
	"password-reset-codes": monkDB.get<{
		code: string;
		userID: integer;
		createdOn: number;
	}>("password-reset-codes"),
	"class-achievements": monkDB.get<ClassAchievementDocument>("class-achievements"),
	"score-blacklist":
		monkDB.get<{ scoreID: string; userID: integer; score: ScoreDocument }>("score-blacklist"),
	"verify-email-codes":
		monkDB.get<{ userID: integer; code: string; email: string }>("verify-email-codes"),
};

export type StaticDatabases =
	| "sessions"
	| "session-view-cache"
	| "folders"
	| "folder-chart-lookup"
	| "scores"
	| "personal-bests"
	| "imports"
	| "import-timings"
	| "goals"
	| "user-goals"
	| "user-milestones"
	| "milestones"
	| "game-stats"
	| "game-settings"
	| "users"
	| "kai-auth-tokens"
	| "bms-course-lookup"
	| "api-tokens"
	| "import-locks"
	| "tables"
	| "game-stats-snapshots"
	| "arc-saved-profiles"
	| "user-private-information"
	| "oauth2-clients"
	| "oauth2-auth-codes"
	| "fer-settings"
	| "orphan-chart-queue"
	| "password-reset-codes"
	| "user-settings"
	| "counters"
	| "score-blacklist"
	| "verify-email-codes"
	| "class-achievements";

export type Databases = StaticDatabases | `songs-${Game}` | `charts-${Game}`;

export default db;
