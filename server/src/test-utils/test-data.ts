import fs from "fs";
import {
    ChartDocument,
    PBScoreDocument,
    ScoreDocument,
    GoalDocument,
    UserGoalDocument,
    FolderDocument,
    MilestoneDocument,
    SongDocument,
} from "kamaitachi-common";
import path from "path";
import db from "../external/mongo/db";
import { DryScore } from "../lib/score-import/framework/common/types";
import { BarbatosScore } from "../lib/score-import/import-types/ir/barbatos/types";

const file = (name: string) => path.join(__dirname, "/test-data", name);

export const GetKTDataJSON = (name: string) => JSON.parse(fs.readFileSync(file(name), "utf-8"));
export const GetKTDataBuffer = (name: string) => fs.readFileSync(file(name));

export const TestingIIDXSPDryScore = GetKTDataJSON(
    "./kamaitachi/iidx-dryscore.json"
) as DryScore<"iidx:SP">;

export const TestingIIDXSPScorePB = GetKTDataJSON(
    "./kamaitachi/iidx-scorepb.json"
) as PBScoreDocument<"iidx:SP">;
export const TestingIIDXSPScore = GetKTDataJSON(
    "./kamaitachi/iidx-score.json"
) as ScoreDocument<"iidx:SP">;

export const Testing511SPA = GetKTDataJSON(
    "./kamaitachi/iidx-511spa.json"
) as ChartDocument<"iidx:SP">;

export const Testing511Song = GetKTDataJSON(
    "./kamaitachi/iidx-511-song.json"
) as SongDocument<"iidx">;

export const TestingDoraChart = GetKTDataJSON(
    "./kamaitachi/gitadora-ithinkabtyou.json"
) as ChartDocument<"gitadora:Dora">;

export const TestingSDVXSingleDryScore = GetKTDataJSON(
    "./kamaitachi/sdvx-dryscore.json"
) as DryScore<"sdvx:Single">;

export const TestingGITADORADoraDryScore = GetKTDataJSON(
    "./kamaitachi/gitadora-dryscore.json"
) as DryScore<"gitadora:Dora">;

export const TestingIIDXEamusementCSV26 = GetKTDataBuffer(
    "./eamusement-iidx-csv/pre-leggendaria.csv"
);
export const TestingIIDXEamusementCSV27 = GetKTDataBuffer(
    "./eamusement-iidx-csv/post-leggendaria.csv"
);

export const TestingBarbatosScore: BarbatosScore = GetKTDataJSON("./barbatos/base.json");

export const HC511Goal: GoalDocument = {
    charts: {
        type: "single",
        data: Testing511SPA.chartID,
    },
    createdBy: 1,
    game: "iidx",
    goalID: "mock_goalID",
    playtype: "SP",
    timeAdded: 0,
    title: "HC 5.1.1. SPA",
    criteria: {
        mode: "single",
        value: 5,
        key: "scoreData.lampIndex",
    },
};

export const HC511UserGoal: UserGoalDocument = {
    achieved: false,
    timeAchieved: null,
    game: "iidx",
    playtype: "SP",
    goalID: "mock_goalID",
    lastInteraction: null,
    outOf: 5,
    outOfHuman: "HARD CLEAR",
    progress: null,
    progressHuman: "NO DATA",
    timeSet: 0,
    userID: 1,
};

export const TestingIIDXFolderSP10: FolderDocument = {
    title: "Level 10",
    game: "iidx",
    playtype: "SP",
    type: "charts",
    folderID: "ed9d8c734447ce67d7135c0067441a98cc81aeaf",
    table: "Levels",
    tableIndex: 10,
    data: {
        level: "10",
        "flags¬IN BASE GAME": true,
    },
};

export const TestingIIDXSPMilestone: MilestoneDocument = {
    createdBy: 1,
    criteria: {
        type: "all",
    },
    desc: "testing milestone",
    game: "iidx",
    playtype: "SP",
    group: "ExampleGroup",
    groupIndex: 1,
    milestoneID: "example_milestone_id",
    name: "Example Milestone",
    milestoneData: [
        {
            title: "Group1",
            desc: "Foo",
            goals: [
                {
                    goalID: "eg_goal_1",
                },
                {
                    goalID: "eg_goal_2",
                },
            ],
        },
        {
            title: "Group2",
            desc: "Bar",
            goals: [
                {
                    goalID: "eg_goal_3",
                },
                {
                    goalID: "eg_goal_4",
                },
            ],
        },
    ],
};

export async function LoadKTBlackIIDXData() {
    const songs = GetKTDataJSON("./kamaitachi/ktblack-songs-iidx.json");
    const charts = GetKTDataJSON("./kamaitachi/ktblack-charts-iidx.json");

    await db.songs.iidx.remove({});
    await db.songs.iidx.insert(songs);
    await db.charts.iidx.remove({});
    await db.charts.iidx.insert(charts);
}

export const barbScore: BarbatosScore = {
    clear_type: 2,
    did_fail: false,
    difficulty: 1,
    critical: 100,
    error: 5,
    near_total: 50,
    near_fast: 40,
    near_slow: 10,
    gauge_type: 1,
    is_skill_analyser: false,
    level: 10,
    max_chain: 100,
    percent: 90,
    score: 9_000_000,
    song_id: 1,
};
