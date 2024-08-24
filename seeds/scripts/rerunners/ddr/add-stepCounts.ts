import { ReadCollection, WriteCollection } from "../../util";
import { ChartDocument, SongDocument } from "tachi-common";
import fs from "fs";

export interface StepData {
	Title: string;
	Difficulty: string;
	Artist: string;
	Steps: number;
	"O.K.s (Lines With Holds+Shock Arrows)": number;
}

function cleanup(stepDataArray: StepData[]) {
	for (const stepData of stepDataArray) {
		if (stepData.Title.includes("|")) {
			const cleanTitle = stepData.Title.split("|")[0]?.trim();
			if (cleanTitle) {
				stepData.Title = cleanTitle;
			}
		}
		if (stepData.Artist.includes("|")) {
			const cleanArtist = stepData.Artist.split("|")[0]?.trim();
			if (cleanArtist) {
				stepData.Artist = cleanArtist;
			}
		}
	}
}

export function parseJson(stepDataArray: StepData[], playtype: string) {
	const songs = ReadCollection("songs-ddr.json");
	const existingChartDocs: ChartDocument<"ddr:SP" | "ddr:DP">[] =
		ReadCollection("charts-ddr.json");
	for (const chart of existingChartDocs) {
		if (chart.playtype === playtype) {
			const song: SongDocument<"ddr"> = songs.find(
				(s: SongDocument<"ddr">) => s.id === chart.songID
			);
			const matchingStepData = stepDataArray.find(
				(stepData: StepData) =>
					stepData.Title === song.title && stepData.Difficulty === chart.difficulty && stepData.Artist === song.artist
			);
			if (matchingStepData) {
				chart.data.stepCount = matchingStepData.Steps;
				chart.data.okCount = matchingStepData["O.K.s (Lines With Holds+Shock Arrows)"];
			}
		}
	}

	// overwrite this collection instead of mutating it
	// we already know the existing chart docs and might have mutated them to
	// declare the new versions, or update chart constants.
	WriteCollection("charts-ddr.json", [...existingChartDocs]);
}

let stepData = JSON.parse(fs.readFileSync("single.json", "utf-8"));
cleanup(stepData);
parseJson(stepData, "SP");

stepData = JSON.parse(fs.readFileSync("double.json", "utf-8"));
cleanup(stepData);
parseJson(stepData, "DP");
