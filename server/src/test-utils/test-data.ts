import fs from "fs";
import { ChartDocument } from "kamaitachi-common";
import path from "path";
import { DryScore } from "../types";

const file = (name: string) => path.join(__dirname, "/test-data", name);

const JSONFile = (name: string) => JSON.parse(fs.readFileSync(file(name), "utf-8"));
const BufferFromFile = (name: string) => fs.readFileSync(file(name));

export const TestingIIDXSPDryScore = JSONFile(
    "./kamaitachi/iidx-dryscore.json"
) as DryScore<"iidx:SP">;

export const Testing511SPA = JSONFile("./kamaitachi/iidx-511spa.json") as ChartDocument<"iidx:SP">;

export const TestingDoraChart = JSONFile(
    "./kamaitachi/gitadora-ithinkabtyou.json"
) as ChartDocument<"gitadora:Dora">;

export const TestingSDVXSingleDryScore = JSONFile(
    "./kamaitachi/sdvx-dryscore.json"
) as DryScore<"sdvx:Single">;

export const TestingGITADORADoraDryScore = JSONFile(
    "./kamaitachi/gitadora-dryscore.json"
) as DryScore<"gitadora:Dora">;

export const TestingIIDXEamusementCSV26 = BufferFromFile(
    "./csv-eamusement-iidx/pre-leggendaria.csv"
);
export const TestingIIDXEamusementCSV27 = BufferFromFile(
    "./csv-eamusement-iidx/post-leggendaria.csv"
);
