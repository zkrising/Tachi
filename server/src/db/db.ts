import {
    ChartDocument,
    config,
    CounterDocument,
    FolderDocument,
    Game,
    GoalDocument,
    IIDXBPIData,
    IIDXEamusementScoreDocument,
    ImportDocument,
    InviteCodeDocument,
    MilestoneDocument,
    NotificationDocument,
    Playtypes,
    PrivateUserDocument,
    PublicAPIKeyDocument,
    ScoreDocument,
    SessionDocument,
    SongDocument,
    UserGoalDocument,
    UserMilestoneDocument,
} from "kamaitachi-common";
import monk, { ICollection } from "monk";
import CreateLogCtx from "../logger";

const logger = CreateLogCtx("db.ts");

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
    "iidx-eam-scores": monkDB.get<IIDXEamusementScoreDocument>("iidx-eam-scores"),
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
    // i have to handwrite this out for TS... :(
    charts: {
        bms: monkDB.get<`bms:${Playtypes["bms"]}`>(`charts-bms`),
        chunithm: monkDB.get<`chunithm:${Playtypes["chunithm"]}`>(`charts-chunithm`),
        ddr: monkDB.get<`ddr:${Playtypes["ddr"]}`>(`charts-ddr`),
        gitadora: monkDB.get<`gitadora:${Playtypes["gitadora"]}`>(`charts-gitadora`),
        iidx: monkDB.get<`iidx:${Playtypes["iidx"]}`>(`charts-iidx`),
        jubeat: monkDB.get<`jubeat:${Playtypes["jubeat"]}`>(`charts-jubeat`),
        maimai: monkDB.get<`maimai:${Playtypes["maimai"]}`>(`charts-maimai`),
        museca: monkDB.get<`museca:${Playtypes["museca"]}`>(`charts-museca`),
        popn: monkDB.get<`popn:${Playtypes["popn"]}`>(`charts-popn`),
        sdvx: monkDB.get<`sdvx:${Playtypes["sdvx"]}`>(`charts-sdvx`),
        usc: monkDB.get<`usc:${Playtypes["usc"]}`>(`charts-usc`),
    },
};

for (const game of config.supportedGames) {
    GameCollectionPartial.songs[game] = monkDB.get<SongDocument>(`songs-${game}`);
}

// a typescript-friendly interface for the database.
const db = Object.assign(StaticCollections, GameCollectionPartial as GameCollectionFull);

export default db;
