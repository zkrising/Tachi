/* eslint-disable no-await-in-loop */
// diffs an out JSON with the kamaitachi db, optionally syncs with -s.

import fs from "fs";
import path from "path";
import db from "external/mongo/db";
import { MDBJson } from "./types";
import { Difficulties, Playtypes, ChartDocument } from "tachi-common";
import CreateLogCtx from "../../../src/common/logger";

import { Command } from "commander";

const program = new Command();
program.option("-s --sync", "Sync KTDB with the file.");

program.parse(process.argv);

const options = program.opts();

const dataset = JSON.parse(
	fs.readFileSync(path.join(__dirname, "./out.json"), "utf-8")
) as MDBJson[];

const logger = CreateLogCtx(__filename);

(async () => {
	for (const data of dataset) {
		for (const d in data.difficulties) {
			const diff = d as keyof typeof data.difficulties;

			if (data.difficulties[diff] === 0) {
				logger.verbose(`Skipping chart ${data.title} ${diff}`);
				continue;
			}

			const spl = diff.split("-");
			const chart = (await db.charts.iidx.findOne({
				"data.inGameID": data.songID,
				playtype: spl[0] as Playtypes["iidx"],
				difficulty: spl[1] as Difficulties["iidx:SP" | "iidx:DP"],
				isPrimary: true,
			})) as ChartDocument<"iidx:SP" | "iidx:DP">;

			if (!chart) {
				logger.warn(`No chart exists for ${data.title} (${diff}).`);
				continue;
			}

			if (chart.levelNum !== data.difficulties[diff]) {
				logger.warn(
					`Level Mismatch with ${data.title} (${diff}) [${chart.levelNum} -> ${data.difficulties[diff]}]`
				);

				if (options.sync) {
					await db.charts.iidx.update(
						{
							_id: chart._id,
						},
						{
							$set: {
								levelNum: data.difficulties[diff],
								level: data.difficulties[diff].toString(),
							},
						}
					);
				}
			}

			if (chart.data.notecount !== data.notecounts[diff]) {
				if (
					data.notecounts[diff] === undefined ||
					Math.abs(chart.data.notecount - data.notecounts[diff]!) > 2
				) {
					logger.error(
						`Significant Notecount Mismatch with ${data.title} (${diff}) [${chart.data.notecount} -> ${data.notecounts[diff]}] - skipping.`
					);
					// continue;
				}

				logger.warn(
					`Notecount Mismatch with ${data.title} (${diff}) [${chart.data.notecount} -> ${data.notecounts[diff]}]`
				);

				if (options.sync) {
					await db.charts.iidx.update(
						{
							_id: chart._id,
						},
						{
							$set: {
								"data.notecount": data.notecounts[diff],
							},
						}
					);
				}
			}
		}
	}
	logger.info("done");
})();
