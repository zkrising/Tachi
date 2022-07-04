/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// ^ These rules are disabled for good reason. We have to deal with some very nonsensical types here
// so we just disable these rules. I know, it sucks, but we'll live.
import { ONE_MINUTE } from "lib/constants/time";
import CreateLogCtx from "lib/logger/logger";
import { Environment, ServerConfig } from "lib/setup/config";
import monk from "monk";
import { allSupportedGames } from "tachi-common/js/config/static-config";
import { GetMillisecondsSince } from "utils/misc";
import type { OrphanScoreDocument } from "lib/score-import/import-types/common/types";
import type { TMiddleware, ICollection } from "monk";
import type {
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
	GoalSubscriptionDocument,
	ImportDocument,
	ImportTimingsDocument,
	integer,
	InviteCodeDocument,
	KaiAuthDocument,
	MilestoneDocument,
	MilestoneSetDocument,
	MilestoneSubscriptionDocument,
	NotificationDocument,
	OrphanChart,
	PBScoreDocument,
	PublicUserDocument,
	RecentlyViewedFolderDocument,
	ScoreDocument,
	SessionDocument,
	SessionViewDocument,
	SongDocument,
	TableDocument,
	TachiAPIClientDocument,
	UGPTSettings,
	UserGameStats,
	UserGameStatsSnapshot,
	UserSettings,
} from "tachi-common";
import type { MigrationDocument, PrivateUserInfoDocument } from "utils/types";

const logger = CreateLogCtx(__filename);

let dbName = ServerConfig.MONGO_DATABASE_NAME;

/* istanbul ignore next */
if (Environment.nodeEnv === "test") {
	dbName = `testingdb`;
}

logger.info(`Connecting to database ${Environment.mongoUrl}/${dbName}...`, { bootInfo: true });
const dbtime = process.hrtime.bigint();

// By default the connectTimeoutMS is 30 seconds. This has been upped to 2 minutes, due to poor performance
// inside githubs test runners.
export const monkDB = monk(`${Environment.mongoUrl}/${dbName}`, {
	serverSelectionTimeoutMS: ONE_MINUTE * 2,
});

/* istanbul ignore next */
monkDB
	.then(() => {
		logger.info(`Database connection successful: took ${GetMillisecondsSince(dbtime)}ms`, {
			bootInfo: true,
		});
	})
	.catch((err) => {
		logger.crit(`Failed to connect to database: ${err}`, () => {
			process.exit(1);
		});
	});

/**
 * Removes _id from the returns of find/findOne. Note that this function is littered with eslint-disables
 * due to it working with some pretty wobbly types.
 */
const RemoveIDFromFindReturnsMiddleware: TMiddleware = () => (next) => (args: any, method) => {
	if ((method === "find" || method === "findOne") && !args.options.projectID) {
		if (args.options.projection) {
			args.options.projection._id = 0;
		} else {
			args.options.projection = { _id: 0 };
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return next(args, method);
};

// a bug in monks types means that :any has to be used here. Maybe we'll make a PR for this?
const StripIDFromDBInsertsMiddleware: TMiddleware = () => (next) => (args: any, method) => {
	if (method === "insert") {
		if (Array.isArray(args.data)) {
			for (const d of args.data) {
				delete d._id;
			}
		} else {
			delete args.data._id;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
	return next(args, method);
};

monkDB.addMiddleware(StripIDFromDBInsertsMiddleware);
monkDB.addMiddleware(RemoveIDFromFindReturnsMiddleware);

export async function CloseMongoConnection() {
	await monkDB.close();
}

// Typescript incorrectly casts this into songs[string] => songdocument,
// Force cast it out.
const songs = Object.fromEntries(
	allSupportedGames.map((e) => [e, monkDB.get<SongDocument>(`songs-${e}`)])
) as unknown as Record<Game, ICollection<SongDocument>>;

const charts = Object.fromEntries(
	allSupportedGames.map((e) => [e, monkDB.get<ChartDocument>(`charts-${e}`)])
) as unknown as Record<Game, ICollection<ChartDocument>>;

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
	"goal-subs": monkDB.get<GoalSubscriptionDocument>("goal-subs"),
	milestones: monkDB.get<MilestoneDocument>("milestones"),
	"milestone-subs": monkDB.get<MilestoneSubscriptionDocument>("milestone-subs"),
	users: monkDB.get<PublicUserDocument>("users"),
	imports: monkDB.get<ImportDocument>("imports"),
	"import-timings": monkDB.get<ImportTimingsDocument>("import-timings"),
	sessions: monkDB.get<SessionDocument>("sessions"),
	invites: monkDB.get<InviteCodeDocument>("invites"),
	counters: monkDB.get<CounterDocument>("counters"),
	"game-stats": monkDB.get<UserGameStats>("game-stats"),
	"kai-auth-tokens": monkDB.get<KaiAuthDocument>("kai-auth-tokens"),
	"bms-course-lookup": monkDB.get<BMSCourseDocument>("bms-course-lookup"),
	"api-tokens": monkDB.get<APITokenDocument>("api-tokens"),
	"orphan-scores": monkDB.get<OrphanScoreDocument>("orphan-scores"),
	"import-locks": monkDB.get<{ userID: integer; locked: boolean }>("import-locks"),
	tables: monkDB.get<TableDocument>("tables"),
	"game-settings": monkDB.get<UGPTSettings>("game-settings"),
	"game-stats-snapshots": monkDB.get<UserGameStatsSnapshot>("game-stats-snapshots"),
	"session-view-cache": monkDB.get<SessionViewDocument>("session-view-cache"),
	"arc-saved-profiles": monkDB.get<ARCSavedProfileDocument>("arc-saved-profiles"),
	"user-settings": monkDB.get<UserSettings>("user-settings"),
	"user-private-information": monkDB.get<PrivateUserInfoDocument>("user-private-information"),
	"api-clients": monkDB.get<TachiAPIClientDocument>("api-clients"),

	// i've inlined this one because i don't see it appearing anywhere else.
	"oauth2-auth-codes":
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
	"recent-folder-views": monkDB.get<RecentlyViewedFolderDocument>("recent-folder-views"),
	"milestone-sets": monkDB.get<MilestoneSetDocument>("milestone-sets"),
	migrations: monkDB.get<MigrationDocument>("migrations"),
	notifications: monkDB.get<NotificationDocument>("notifications"),
};

export type StaticDatabases = Exclude<keyof typeof db, "charts" | "songs">;

export type Databases = StaticDatabases | `charts-${Game}` | `songs-${Game}`;

export default db;
