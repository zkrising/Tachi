import db from "external/mongo/db";
import fs from "fs";
import {
	USC_DEFAULT_HOLD,
	USC_DEFAULT_MISS,
	USC_DEFAULT_NEAR,
	USC_DEFAULT_PERFECT,
	USC_DEFAULT_SLAM,
} from "lib/constants/usc-ir";
import CreateLogCtx from "lib/logger/logger";
import { OrphanScore } from "lib/score-import/framework/orphans/orphans";
import UpdateScore from "lib/score-mutation/update-score";
import { integer, ScoreDocument } from "tachi-common";
import { DeleteScore } from "lib/score-mutation/delete-scores";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";

const logger = CreateLogCtx(__filename);

const oldChartIDtoSHA1 = JSON.parse(fs.readFileSync(`${__dirname}/usc-map.json`, "utf-8"));

if (require.main === module) {
	(async () => {
		const keep = await db.charts.usc.find(
			{ "data.hashSHA1": { $in: Object.values(oldChartIDtoSHA1) } },
			{ projection: { chartID: 1, "data.hashSHA1": 1, songID: 1, playtype: 1 } }
		);

		// @ts-expect-error asdf
		const keepHashes = keep.map((e) => e.data.hashSHA1);

		const keepChartIDs = Object.entries(oldChartIDtoSHA1)
			.filter(([, v]) => keepHashes.includes(v))
			.map(([k]) => k);

		const rmScores = (await db.scores.find({
			game: "usc",
			chartID: { $nin: keepChartIDs },
		})) as ScoreDocument<"usc:Controller" | "usc:Keyboard">[];

		logger.info(`Re-orphaning and unseating ${rmScores.length} scores.`);

		let i = 0;
		for (const score of rmScores) {
			i++;
			if (i % 100 === 0) {
				logger.info(`${i}/${rmScores.length}...`);
			}

			const chartSHA1 = oldChartIDtoSHA1[score.chartID];

			if (!chartSHA1) {
				logger.warn(`Can't find a chartsha1 for ${score.chartID}?`);
				continue;
			}

			await ReOrphanScore(score, chartSHA1);
			await DeleteScore(score, false, false);
		}

		const keepScores = await db.scores.find({
			game: "usc",
			chartID: { $in: keepChartIDs },
		});
		logger.info(`Keeping and migrating ${keepScores.length} scores.`);

		const sha1ToChartID = Object.fromEntries(
			keep.map((e) => [
				// @ts-expect-error hashsha1 exists i'm just lazy
				`${e.data.hashSHA1}:${e.playtype}`,
				{ chartID: e.chartID, songID: e.songID },
			])
		) as { [key: string]: { chartID: string; songID: integer } };

		let j = 0;
		for (const score of keepScores) {
			j++;
			if (j % 100 === 0) {
				logger.info(`${j}/${keepScores.length}`);
			}

			const sha1 = oldChartIDtoSHA1[score.chartID];
			const newChartID = sha1ToChartID[`${sha1}:${score.playtype}`].chartID;
			const newSongID = sha1ToChartID[`${sha1}:${score.playtype}`].songID;

			if (!newChartID) {
				logger.error(
					`Couldn't resolve old:${score.chartID} -> sha1:${sha1} (playtype: ${score.playtype}) -> new:${newChartID}?`
				);

				throw new Error("panic");
			}

			await UpdateScore(
				score,
				Object.assign({}, score, { songID: newSongID, chartID: newChartID }),
				false
			);
		}

		// You'd think the update scripts don't result in pbs that point to
		// dead charts, but they do.
		logger.info(`Reloading USC PBs.`);
		await db["personal-bests"].remove({ game: "usc" });
		await UpdateAllPBs(undefined, { game: "usc" });

		logger.info(`Done.`);

		process.exit(0);
	})();
}

function ReOrphanScore(sc: ScoreDocument<"usc:Controller" | "usc:Keyboard">, chartSHA1: string) {
	let mirror = false;
	let random = false;

	if (sc.scoreMeta.noteMod === "MIR-RAN") {
		mirror = true;
		random = false;
	} else if (sc.scoreMeta.noteMod === "RANDOM") {
		random = true;
	} else if (sc.scoreMeta.noteMod === "MIRROR") {
		mirror = true;
	}

	const gaugeType =
		sc.scoreMeta.gaugeMod === "NORMAL"
			? 0
			: sc.scoreMeta.gaugeMod === "HARD"
			? 1
			: sc.scoreMeta.gaugeMod === "PERMISSIVE"
			? 2
			: 0;

	return OrphanScore(
		"ir/usc",
		sc.userID,
		{
			combo: sc.scoreData.hitMeta.maxCombo ?? null,
			crit: sc.scoreData.judgements.critical!,
			near: sc.scoreData.judgements.near!,
			error: sc.scoreData.judgements.miss!,
			early: sc.scoreData.hitMeta.fast ?? null,
			late: sc.scoreData.hitMeta.slow ?? null,
			gauge: sc.scoreData.hitMeta.gauge!,
			options: {
				autoFlags: 0,
				gaugeOpt: 0,
				gaugeType,
				mirror,
				random,
			},
			score: sc.scoreData.score,
			timestamp: sc.timeAchieved!,
			windows: {
				perfect: USC_DEFAULT_PERFECT,
				good: USC_DEFAULT_NEAR,
				hold: USC_DEFAULT_HOLD,
				miss: USC_DEFAULT_MISS,
				slam: USC_DEFAULT_SLAM,
			},
		},
		{
			chartHash: chartSHA1,
			playtype: sc.playtype,
			timeReceived: sc.timeAchieved!,
		},
		`Lost parent as a result of USC migration.`,
		"usc",
		logger
	);
}
