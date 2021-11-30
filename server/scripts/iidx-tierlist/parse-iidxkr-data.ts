/* eslint-disable no-await-in-loop */
import db from "external/mongo/db";
import fs from "fs";
import CreateLogCtx from "lib/logger/logger";
import path from "path";
import { Difficulties } from "tachi-common";
import { FindChartWithPTDF } from "utils/queries/charts";
import { FindSongOnTitle } from "utils/queries/songs";

const logger = CreateLogCtx(__filename);

async function parseKr(
	file: string,
	mode: "NC" | "HC",
	catVals: { text: string; value: number; idv: boolean }[]
) {
	const krdata = JSON.parse(fs.readFileSync(path.join(__dirname, "./iidx-pe-kr", file), "utf-8"));

	for (let i = 0; i < krdata.categories.length; i++) {
		const data = krdata.categories[i];
		if (data.sortindex < 0) {
			continue;
		}

		const cv = catVals[i];

		if (!cv) {
			throw new Error(`cv krdata mismatch ${krdata.categories.length} ${catVals.length}?`);
		}

		for (const item of data.items) {
			const song = await FindSongOnTitle("iidx", item.data.title.replace(/†$/u, "").trim());

			if (!song) {
				logger.warn(`Could not find song with title ${item.data.title}`);
				continue;
			}

			const t = item.data.type;

			let diff: Difficulties["iidx:SP"];
			if (t === "A") {
				diff = "ANOTHER";
			} else if (t === "L") {
				diff = "LEGGENDARIA";
			} else if (t === "H") {
				diff = "HYPER";
			} else if (t === "N") {
				diff = "NORMAL";
			} else {
				logger.warn(`${song.title} Unknown difficulty ${t}.`);
				continue;
			}

			const chart = await FindChartWithPTDF("iidx", song.id, "SP", diff);

			if (!chart) {
				logger.warn(`${song.title} ${diff} - Couldn't find chart?`);
				continue;
			}

			// Update this part of the tierlist, we've got everything.

			await db.charts.iidx.update(
				{
					chartID: chart.chartID,
				},
				{
					$set: {
						[`tierlistInfo.kt-${mode}`]: {
							text: cv.text,
							value: cv.value,
							individualDifference: cv.idv,
						},
					},
				}
			);

			logger.verbose(`Updated ${chart.chartID} to value ${cv.value}.`);
		}
	}

	logger.info(`Finished parsing ${file}`);
}

function h(text: string, value: number, idv = false) {
	return { text, value, idv };
}

parseKr("sp11N.json", "NC", [
	h("11S+", 12.2),
	h("11S", 12),
	h("11A+", 11.9),
	h("11A", 11.8),
	h("11B", 11.6),
	h("11C", 11.4),
	h("11D", 11.2),
	h("11E", 11.0),
	h("11F", 10.8),
]);

parseKr("sp11H.json", "HC", [
	h("11S+", 12.2),
	h("11S+", 12.2, true), // 個人差
	h("11S", 12),
	h("11S", 12, true), // 個人差
	h("11A+", 11.9),
	h("11A+", 11.9, true), // 個人差
	h("11A", 11.8),
	h("11A", 11.0, true), // 個人差
	h("11B+", 11.7),
	h("11B", 11.6),
	h("11C", 11.4),
	h("11D", 11.2),
	h("11E", 11.0),
	h("11F", 10.8),
]);
