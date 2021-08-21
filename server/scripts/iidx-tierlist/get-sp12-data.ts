/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
import db from "external/mongo/db";
import fetch from "node-fetch";
import { FindSongOnTitle } from "../../src/common/database-lookup/song";
import { FindChartWithPTDF } from "../../src/common/database-lookup/chart";
import { Difficulties, TierlistDataDocument } from "tachi-common";

import { CalculateTierlistDataID } from "../../src/common/tierlist";
import CreateLogCtx from "../../src/common/logger";

const logger = CreateLogCtx(__filename);

const TIERLIST_ID = "ee9b756e50cff8282091102257b01f423ef855f2";

async function FetchSP12Data() {
	const rj = await fetch("https://sp12.iidx.app/api/v1/sheets").then((r) => r.json()); // will throw if somethings wrong, anyway

	if (!rj.sheets) {
		throw new Error(`No sheets in return from sp12?`);
	}

	const tdd: TierlistDataDocument<"Individual Difference">[] = [];

	for (const sh of rj.sheets) {
		let chart;
		try {
			chart = await HumanisedTitleLookup(sh.title);
		} catch (err) {
			logger.error((err as Error).message);
			continue;
		}

		for (const key of ["NORMAL CLEAR", "HARD CLEAR", "EX HARD CLEAR"]) {
			let fakeKey;
			let val;

			switch (key) {
				case "NORMAL CLEAR":
					fakeKey = "n_clear";
					const v = Math.floor(sh[fakeKey] / 2);

					if (v === 9) {
						val = 11.8;
					} else if (v === 8) {
						val = 12.0;
					} else if (v === 7) {
						val = 12.2;
					} else if (v === 6) {
						val = 12.4;
					} else if (v === 5) {
						val = 12.6;
					} else if (v < 0) {
						continue;
					} else {
						val = 12.6 + (5 - v) * 0.1;
					}

					break;
				case "HARD CLEAR":
					fakeKey = "hard";
					const v2 = Math.floor(sh[fakeKey] / 2);

					if (v2 === 9) {
						val = 11.9;
					} else if (v2 === 8) {
						val = 12.1;
					} else if (v2 === 7) {
						val = 12.3;
					} else if (v2 === 6) {
						val = 12.5;
					} else if (v2 === 5) {
						val = 12.7;
					} else if (v2 < 0) {
						continue;
					} else {
						val = 12.7 + (5 - v2) * 0.1;
					}

					break;
				case "EX HARD CLEAR":
					fakeKey = "exh";

					const v3 = sh[fakeKey];
					if (v3 < 0) {
						continue;
					}

					val = 12.4 + (12 - v3) * 0.1;

					break;
				default:
					throw new Error("??");
			}

			const humanised = sh[`${fakeKey}_string`];

			if (humanised === "難易度未定") {
				continue;
			}

			if (val < 11.8) {
				logger.info(`Skipping ${sh.title} ${key}, ${humanised}.`);
				continue;
			}

			val = parseFloat(val.toFixed(2));

			tdd.push({
				chartID: chart.chartID,
				type: "lamp",
				tierlistID: TIERLIST_ID,
				tierlistDataID: CalculateTierlistDataID(chart.chartID, "lamp", key, TIERLIST_ID),
				key,
				data: {
					humanised,
					value: val,
					flags: {
						"Individual Difference": !!humanised.match(/個人差/u),
					},
				},
			});
		}
	}

	logger.info(`Inserting ${tdd.length} documents...`);

	await db["tierlist-data"].insert(tdd);

	logger.info("Done!");

	process.exit(0);
}

function isOdd(num: number) {
	return num % 2 !== 0;
}

async function HumanisedTitleLookup(originalTitle: string) {
	let difficulty: Difficulties["iidx:SP"] = "ANOTHER";

	let title = originalTitle;

	if (title.match(/(†|†LEGGENDARIA)$/u)) {
		difficulty = "LEGGENDARIA";
		title = title.split("†")[0]; // this will break if there is ever a ptp leggendaria
	} else if (title.match(/\[H\]$/u)) {
		difficulty = "HYPER";
		title = title.split("[")[0];
	} else if (title.match(/\[A\]$/u)) {
		difficulty = "ANOTHER"; // lmao
		title = title.split("[")[0];
	}

	const song = await FindSongOnTitle("iidx", title);

	if (!song) {
		throw new Error(
			`Could not resolve song ${title} (${difficulty}) (Original ${originalTitle}).`
		);
	}

	const chart = await FindChartWithPTDF("iidx", song.id, "SP", difficulty);

	if (!chart) {
		throw new Error(
			`Could not resolve chart ${title} ${difficulty} (Original ${originalTitle}).`
		);
	}

	return chart;
}

FetchSP12Data();
