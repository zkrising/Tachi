import {
    ChartDocument,
    config,
    CounterDocument,
    FolderDocument,
    Game,
    GoalDocument,
    IIDXBPIData,
    ImportDocument,
    InviteCodeDocument,
    MilestoneDocument,
    NotificationDocument,
    PrivateUserDocument,
    PublicAPIKeyDocument,
    ScoreDocument,
    SessionDocument,
    SongDocument,
    UserGoalDocument,
    UserMilestoneDocument,
    ValidDatabases,
} from "kamaitachi-common";
import monk, { ICollection, IMonkManager } from "monk";
import createLogCtx from "./logger";

const logger = createLogCtx("db.ts");

const url =
    process.env.NODE_ENV === "test" ? "localhost:27017/testingdb" : "localhost:27017/ktblackdb";

let dbtime: [number, number] = [0, 0];
if (process.env.NODE_ENV !== "test") {
    logger.info(`Connecting to database ${url}...`);
    dbtime = process.hrtime();
}

export let monkDB = monk(url);

if (process.env.NODE_ENV !== "test") {
    monkDB.then(() => {
        let time = process.hrtime(dbtime);
        let elapsed = time[0] + time[1] / 1000000;
        logger.info(`Database connection successful: took ${elapsed}ms`);
    });
}

export async function ReOpenConnection() {
    monkDB = monk(url);
    await monkDB.then();
}

export async function CloseConnection() {
    await monkDB.close();
}

const StaticCollections = {
    scores: monkDB.get<ScoreDocument>("scores"),
    folders: monkDB.get<FolderDocument>("folders"),
    goals: monkDB.get<GoalDocument>("goals"),
    "user-goals": monkDB.get<UserGoalDocument>("user-goals"),
    milestones: monkDB.get<MilestoneDocument>("milestones"),
    "user-milestones": monkDB.get<UserMilestoneDocument>("user-milestones"),
    users: monkDB.get<PrivateUserDocument>("users"),
    imports: monkDB.get<ImportDocument>("imports"),
    notifications: monkDB.get<NotificationDocument>("notifications"),
    sessions: monkDB.get<SessionDocument>("sessions"),
    "iidx-bpi-data": monkDB.get<IIDXBPIData>("iidx-bpi-data"),
    "public-api-keys": monkDB.get<PublicAPIKeyDocument>("public-api-keys"),
    invites: monkDB.get<InviteCodeDocument>("invites"),
    counters: monkDB.get<CounterDocument>("counters"),
};

type GameCollections = Record<Game, ICollection>;

interface GCPartial {
    songs: Partial<GameCollections>;
    charts: Partial<GameCollections>;
}

interface GameCollectionFull {
    songs: GameCollections;
    charts: GameCollections;
}

let GameCollectionPartial: GCPartial = {
    songs: {},
    charts: {},
};

for (const game of config.supportedGames) {
    GameCollectionPartial.songs[game] = monkDB.get<SongDocument>(`songs-${game}`);
    GameCollectionPartial.charts[game] = monkDB.get<ChartDocument>(`charts-${game}`);
}

// a typescript-friendly interface for the database.
const db = Object.assign(StaticCollections, GameCollectionPartial as GameCollectionFull);

export default db;
