/* eslint-disable no-await-in-loop */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import { Difficulties, integer } from "tachi-common";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";

const logger = CreateLogCtx(__filename);

interface SP12Data {
	id: integer;
	title: string;
	n_clear: integer;
	hard: integer;
	exh: integer;
	n_clear_string: string;
	hard_string: string;
	exh_string: string;
	version: integer;
}

async function FetchSP12Data() {
	const rj: { sheets: SP12Data[] } = await fetch("https://sp12.iidx.app/api/v1/sheets").then(
		(r) => r.json()
	); // will throw if somethings wrong, anyway

	if (!rj.sheets) {
		throw new Error(`No sheets in return from sp12?`);
	}

	for (const sh of rj.sheets) {
		let chart;
		try {
			chart = await HumanisedTitleLookup(sh.title);
		} catch (err) {
			logger.error((err as Error).message);
			continue;
		}

		if (!chart) {
			logger.warn(`Couldn't find chart with title ${sh.title}`);
		}

		for (const key of ["n_clear", "hard", "exh"] as const) {
			let val;

			switch (key) {
				case "n_clear":
					const v = Math.floor(sh[key] / 2);

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
				case "hard":
					const v2 = Math.floor(sh[key] / 2);

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
				case "exh":
					const v3 = sh[key];
					if (v3 < 0) {
						continue;
					}

					val = 12.4 + (12 - v3) * 0.1;

					break;
				default:
					throw new Error("??");
			}

			const stringVal = sh[`${key}_string` as const];

			if (stringVal === "難易度未定") {
				continue;
			}

			val = parseFloat(val.toFixed(2));

			const ktKey = key === "exh" ? "kt-EXHC" : key === "hard" ? "kt-HC" : "kt-NC";

			// If EXH, just save the string version as 12.xx
			// Else, use the A/S+ thing that people are used to.
			const text =
				ktKey === "kt-EXHC"
					? val.toFixed(2)
					: `12${stringVal.replace(/(個人差|地力)/u, "")}`;

			await db.charts.iidx.update(
				{
					chartID: chart.chartID,
				},
				{
					$set: {
						[`tierlistInfo.${ktKey}`]: {
							text,
							value: val,
							individualDifference: stringVal.includes("個人差"),
						},
					},
				}
			);

			logger.info(`Saved ${sh.title} value ${key} = ${val} (${text}).`);
		}
	}

	logger.info("Done!");

	process.exit(0);
}

async function HumanisedTitleLookup(originalTitle: string) {
	let difficulty: Difficulties["iidx:SP"] = "ANOTHER";

	let title = originalTitle;

	if (title.match(/(†|†LEGGENDARIA)$/u)) {
		difficulty = "LEGGENDARIA";
		title = title.split(/(†|†LEGGENDARIA)$/u)[0];
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
