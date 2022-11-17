/* eslint-disable no-await-in-loop */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
import db from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import fetch from "node-fetch";
import p from "prudence";
import { WrapScriptPromise } from "utils/misc";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";
import type { ChartDocument, Difficulties, integer } from "tachi-common";
import { RecalcAllScores } from "utils/calculations/recalc-scores";
import { BacksyncCollectionToBothBranches } from "lib/database-seeds/repo";

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
	// will throw if somethings wrong
	const unvalidatedRJ: unknown = await fetch("https://sp12.iidx.app/api/v1/sheets").then((r) =>
		r.json()
	);

	const err = p(unvalidatedRJ, {
		sheets: [
			{
				id: p.isPositiveNonZeroInteger,
				title: "string",
				n_clear: p.isPositiveInteger,
				hard: p.isPositiveInteger,
				exh: p.isPositiveInteger,
				n_clear_string: "string",
				hard_string: "string",
				exh_string: "string",
				version: p.isPositiveInteger,
			},
		],
	});

	if (err) {
		logger.error(`Got invalid/unexpected content from sp12.`, { unvalidatedRJ });

		throw new Error(`Got invalid/unexpected content from sp12.`);
	}

	const rj = unvalidatedRJ as {
		sheets: Array<SP12Data>;
	};

	const updatedChartIDs: Array<string> = [];

	for (const sh of rj.sheets) {
		let chart: ChartDocument | null;

		try {
			chart = await HumanisedTitleLookup(sh.title);
		} catch (err) {
			logger.error((err as Error).message);
			continue;
		}

		for (const key of ["n_clear", "hard", "exh"] as const) {
			let val;

			switch (key) {
				case "n_clear": {
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
				}

				case "hard": {
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
				}

				case "exh": {
					const v3 = sh[key];

					if (v3 >= 12 || v3 <= 0) {
						continue;
					}

					val = 12.4 + (12 - v3) * 0.1;

					break;
				}

				default:
					throw new Error("??");
			}

			const stringVal = sh[`${key}_string` as const];

			if (stringVal === "難易度未定") {
				continue;
			}

			val = parseFloat(val.toFixed(2));

			let ktKey: keyof ChartDocument<"iidx:SP">["tierlistInfo"];

			if (key === "exh") {
				ktKey = "kt-EXHC";
			} else if (key === "hard") {
				ktKey = "kt-HC";
			} else {
				ktKey = "kt-NC";
			}

			// If EXH, just save the string version as 12.xx
			// Else, use the A/S+ thing that people are used to.
			const text =
				ktKey === "kt-EXHC"
					? val.toFixed(2)
					: `12${stringVal.replace(/(個人差|地力)/u, "")}`;

					const idvDiff =stringVal.includes("個人差");

			const existingTlInfo = chart.tierlistInfo[ktKey];

			if (existingTlInfo && 
				
				existingTlInfo.text === text &&
				existingTlInfo.value === val &&
				existingTlInfo.individualDifference === idvDiff) {
					continue;
				}

				updatedChartIDs.push(chart.chartID);

			await db.charts.iidx.update(
				{
					chartID: chart.chartID,
				},
				{
					$set: {
						[`tierlistInfo.${ktKey}`]: {
							text,
							value: val,
							individualDifference: idvDiff,
						},
					},
				}
			);

			logger.info(`Saved ${sh.title} value ${key} = ${val} (${text}).`);
		}
	}

	if (updatedChartIDs.length !== 0) {
		logger.info(`Finished applying SP12 changes. Recalcing.`);
		logger.info("These changes will be backsynced by a separate script.")

		logger.info(`Recalcing scores.`);
		await RecalcAllScores({
			game: "iidx",
			chartID: { $in: updatedChartIDs },
		});

		logger.info(`Finished recalcing scores.`);

		await BacksyncCollectionToBothBranches("charts-iidx", db.charts.iidx, "Update SP12 Tierlist");
	}

	process.exit(0);
}

async function HumanisedTitleLookup(originalTitle: string) {
	let difficulty: Difficulties["iidx:SP"] = "ANOTHER";

	let title: string | undefined = originalTitle;

	if (/(†|†LEGGENDARIA)$/u.exec(title)) {
		difficulty = "LEGGENDARIA";
		title = title.split(/(†|†LEGGENDARIA)$/u)[0];
	} else if (/\[H\]$/u.exec(title)) {
		difficulty = "HYPER";
		title = title.split("[")[0];
	} else if (/\[A\]$/u.exec(title)) {
		// lmao
		difficulty = "ANOTHER";
		title = title.split("[")[0];
	}

	if (title === undefined) {
		throw new Error(
			`Unexpected title of undefined converted from song title: ${originalTitle}. Was there a faulty split? Was the chart literally called †LEGGENDARIA?`
		);
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

if (require.main === module) {
	WrapScriptPromise(FetchSP12Data(), logger);
}
