import fs from "fs";
import { ChartDocument, PBScoreDocument, ScoreDocument } from "kamaitachi-common";
import path from "path";
import { DryScore } from "../types";

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
    "./csv-eamusement-iidx/pre-leggendaria.csv"
);
export const TestingIIDXEamusementCSV27 = GetKTDataBuffer(
    "./csv-eamusement-iidx/post-leggendaria.csv"
);
