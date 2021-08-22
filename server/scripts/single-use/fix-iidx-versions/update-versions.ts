/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import fs from "fs";
import path from "path";
import CreateLogCtx from "lib/logger/logger";
import { FindSongOnTitleInsensitive } from "utils/queries/songs";

const logger = CreateLogCtx(__filename);

const comicallyLargeJSONData = JSON.parse(
	fs.readFileSync(path.join(__dirname, "./versions.json"), "utf-8")
);

const DIFF_MAP = {
	A: "ANOTHER",
	H: "HYPER",
	N: "NORMAL",
	B: "BEGINNER",
	X: "LEGGENDARIA",
} as any;

function ConvertVersion(c: string) {
	if (c.startsWith("AC")) {
		return c.split("AC")[1];
	} else if (c.startsWith("OM")) {
		return `${c.split("OM")[1]}-omni`;
	} else if (c.startsWith("CS")) {
		return `${c.split("CS")[1]}-cs`;
	} else if (c === "INF") {
		return "inf";
	} else if (c === "BMUS") {
		return "bmus";
	} else {
		logger.error(`Invalid Chart Version ${c}.`);
		throw new Error("Invalid Chart Version");
	}
}

(async () => {
	for (const data of comicallyLargeJSONData) {
		const song = await FindSongOnTitleInsensitive("iidx", data["MUSIC NAME"]);

		if (!song) {
			logger.error(`Can't find song with title ${data["MUSIC NAME"]}.`);
			continue;
		}

		const playtype = data.STYLE === "S" ? "SP" : "DP";

		const difficulty = DIFF_MAP[data.DIFF];

		const relevantVersions = [
			"OM27",
			"OM26",
			"AC27",
			"AC26",
			"INF",
			"CS16",
			"CS15",
			"CS14",
			"CS13",
			"CS12",
			"CS11",
			"CS10",
			"CS9",
			"CS8",
			"CS7",
			"BMUS",
			"CS6",
			"CS5",
			"CS4",
			"CS3",
		]
			.filter((e) => data[e] === "1")
			.map(ConvertVersion);

		if (!relevantVersions.includes("27-omni") && !relevantVersions.includes("inf")) {
			logger.warn(`Song ${song.title} (${playtype} ${difficulty}) has no relevant versions.`);
			continue;
		}

		// logger.info(relevantVersions);

		const chart = await db.charts.iidx.findOne({ songID: song.id, difficulty, playtype });

		if (!chart) {
			logger.error(`Can't find chart ${song.title} (${playtype} ${difficulty})`);
			continue;
		}

		await db.charts.iidx.update({ _id: chart._id }, { $set: { versions: relevantVersions } });
	}

	logger.info("done");

	process.exit(0);
})();
