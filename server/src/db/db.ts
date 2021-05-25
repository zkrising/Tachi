import {
    CounterDocument,
    FolderDocument,
    GoalDocument,
    IIDXBPIData,
    IIDXEamusementScoreDocument,
    ImportDocument,
    TierlistParent,
    InviteCodeDocument,
    TierlistDataDocument,
    USCAuthDocument,
    MilestoneDocument,
    NotificationDocument,
    FolderChartLookup,
    ImportTimingsDocument,
    PrivateUserDocument,
    PublicAPIKeyDocument,
    ScoreDocument,
    KaiAuthDocument,
    SessionDocument,
    AnySongDocument,
    AnyChartDocument,
    UserGameStats,
    UserGoalDocument,
    PBScoreDocument,
    UserMilestoneDocument,
} from "kamaitachi-common";
import monk from "monk";
import CreateLogCtx from "../common/logger";

const logger = CreateLogCtx(__filename);

const base = process.env.MONGO_BASE_URL ?? "127.0.0.1";

const url = process.env.NODE_ENV === "test" ? `${base}:27017/testingdb` : `${base}:27017/ktblackdb`;

let dbtime: [number, number] = [0, 0];
if (process.env.NODE_ENV !== "test") {
    logger.info(`Connecting to database ${url}...`);
    dbtime = process.hrtime();
}

export let monkDB = monk(url);

monkDB
    .then(() => {
        if (process.env.NODE_ENV !== "test") {
            const time = process.hrtime(dbtime);
            const elapsed = time[0] + time[1] / 1e6;
            logger.info(`Database connection successful: took ${elapsed}ms`);
        }
    })
    .catch((err) => {
        logger.crit(err);
        process.exit(1);
    });

export async function ReopenMongoConnection() {
    monkDB = monk(url);
    await monkDB.then();
}

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
    "score-pbs": monkDB.get<PBScoreDocument>("score-pbs"),
    folders: monkDB.get<FolderDocument>("folders"),
    "folder-chart-lookup": monkDB.get<FolderChartLookup>("folder-chart-lookup"),
    goals: monkDB.get<GoalDocument>("goals"),
    "user-goals": monkDB.get<UserGoalDocument>("user-goals"),
    milestones: monkDB.get<MilestoneDocument>("milestones"),
    "user-milestones": monkDB.get<UserMilestoneDocument>("user-milestones"),
    users: monkDB.get<PrivateUserDocument>("users"),
    imports: monkDB.get<ImportDocument>("imports"),
    "import-timings": monkDB.get<ImportTimingsDocument>("import-timings"),
    notifications: monkDB.get<NotificationDocument>("notifications"),
    sessions: monkDB.get<SessionDocument>("sessions"),
    "iidx-bpi-data": monkDB.get<IIDXBPIData>("iidx-bpi-data"),
    "public-api-keys": monkDB.get<PublicAPIKeyDocument>("public-api-keys"),
    invites: monkDB.get<InviteCodeDocument>("invites"),
    counters: monkDB.get<CounterDocument>("counters"),
    "iidx-eam-scores": monkDB.get<IIDXEamusementScoreDocument>("iidx-eam-scores"),
    "game-stats": monkDB.get<UserGameStats>("game-stats"),
    "kai-auth-tokens": monkDB.get<KaiAuthDocument>("kai-auth-tokens"),
    "usc-auth-tokens": monkDB.get<USCAuthDocument>("usc-auth-tokens"),
};

export default db;
