import fs from "fs";
import { ChartDocument } from "kamaitachi-common";
import path from "path";
import { DryScore } from "../types";

const file = (name: string) => path.join(__dirname, name);

const JSONFile = (name: string) => JSON.parse(fs.readFileSync(file(name), "utf-8"));

export const TestingIIDXSPDryScore = JSONFile(
    "./test-data/kamaitachi/iidx-dryscore.json"
) as DryScore<"iidx", "SP", "iidx:SP">;

export const Testing511SPA = JSONFile("./test-data/kamaitachi/iidx-511spa.json") as ChartDocument<
    "iidx",
    "SP",
    "iidx:SP"
>;

export const TestingSDVXSingleDryScore = JSONFile(
    "./test-data/kamaitachi/sdvx-dryscore.json"
) as DryScore<"sdvx", "Single", "sdvx:Single">;
