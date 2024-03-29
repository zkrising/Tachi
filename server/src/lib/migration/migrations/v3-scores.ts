/* eslint-disable no-await-in-loop */
import db, { monkDB } from "external/mongo/db";
import CreateLogCtx from "lib/logger/logger";
import { CreateScoreID } from "lib/score-import/framework/score-importing/score-id";
import { DeleteMultipleScores } from "lib/score-mutation/delete-scores";
import UpdateScore from "lib/score-mutation/update-score";
import { RecalcGameProfiles } from "scripts/state-sync/recalc-game-profiles";
import { GetGPTString, GetGamePTConfig, allSupportedGames } from "tachi-common";
import { UpdateAllPBs } from "utils/calculations/recalc-scores";
import { RecalcSessions } from "utils/calculations/recalc-sessions";
import { EfficientDBIterate } from "utils/efficient-db-iterate";
import type { DryScoreData } from "lib/score-import/framework/common/types";
import type { GPTString, GPTStrings, integer } from "tachi-common";
import type { Migration } from "utils/types";

interface OldScoreData {
	score: number;
	percent: number;
	lamp: string;
	grade: string;
	lampIndex: integer;
	gradeIndex: integer;
	hitMeta: any;
	judgements: any;
}

type ScoreMover<GPT extends GPTString> = (old: OldScoreData) => DryScoreData<GPT>;
type ScoreMovers = {
	[GPT in GPTString]: ScoreMover<GPT>;
};

const IIDX_MV: ScoreMover<GPTStrings["iidx"]> = (old) => ({
	score: old.score,
	lamp: old.lamp as any,
	judgements: old.judgements,
	optional: {
		bp: old.hitMeta.bp,
		comboBreak: old.hitMeta.comboBreak,
		fast: old.hitMeta.fast,
		slow: old.hitMeta.slow,
		maxCombo: old.hitMeta.maxCombo,
		gauge: old.hitMeta.gauge,
		gaugeHistory: old.hitMeta.gaugeHistory,
		gsmEasy: old.hitMeta.gsm?.EASY,
		gsmNormal: old.hitMeta.gsm?.NORMAL,
		gsmHard: old.hitMeta.gsm?.HARD,
		gsmEXHard: old.hitMeta.gsm?.EX_HARD,
	},
});

type NeutralGames = GPTStrings["chunithm" | "museca" | "sdvx" | "usc" | "wacca"];

const _NEUTRAL_MV = (old: OldScoreData): DryScoreData<NeutralGames> => ({
	judgements: old.judgements,
	lamp: old.lamp as any,
	optional: old.hitMeta,
	score: old.score,
});

// silly hack for typechecker
const NEUTRAL_MV = _NEUTRAL_MV as any;

const GITADORA_MV: ScoreMover<GPTStrings["gitadora"]> = (old) => ({
	percent: old.percent,
	optional: old.hitMeta,
	judgements: old.judgements,
	lamp: old.lamp as any,
});

const BMS_MV: ScoreMover<GPTStrings["bms" | "pms"]> = (old) => ({
	score: old.score,
	lamp: old.lamp as any,
	judgements: old.judgements,
	optional: old.hitMeta,
});

const scoreMovers: ScoreMovers = {
	"iidx:SP": IIDX_MV,
	"iidx:DP": IIDX_MV,
	"bms:14K": BMS_MV,
	"bms:7K": BMS_MV,
	"pms:Controller": BMS_MV,
	"pms:Keyboard": BMS_MV,
	"chunithm:Single": NEUTRAL_MV,
	"ongeki:Single": NEUTRAL_MV,
	"usc:Controller": NEUTRAL_MV,
	"usc:Keyboard": NEUTRAL_MV,
	"sdvx:Single": NEUTRAL_MV,
	"wacca:Single": NEUTRAL_MV,
	"museca:Single": NEUTRAL_MV,
	"maimai:Single": (old) => ({
		percent: old.percent,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
	"maimaidx:Single": (old) => ({
		percent: old.percent,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
	"jubeat:Single": (old) => ({
		musicRate: old.percent,
		score: old.score,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
	"itg:Stamina": () => {
		throw new Error(
			`Delete ITG scores instead of migrating them, ITG support has fundamentally changed.`
		);
	},
	"popn:9B": (old) => {
		if (!old.hitMeta.specificClearType) {
			throw new Error(
				`This score has an undefined specificClearType, but this property is now necessary. You should have wiped these scores.`
			);
		}

		return {
			clearMedal: old.hitMeta.specificClearType,
			judgements: old.judgements,
			optional: {
				fast: old.hitMeta.fast,
				slow: old.hitMeta.slow,
				gauge: old.hitMeta.gauge,
				maxCombo: old.hitMeta.maxCombo,
			},
			score: old.score,
		};
	},
	"gitadora:Dora": GITADORA_MV,
	"gitadora:Gita": GITADORA_MV,
	"arcaea:Touch": (old) => ({
		score: old.score,
		judgements: old.judgements,
		lamp: old.lamp as any,
		optional: old.hitMeta,
	}),
};

const logger = CreateLogCtx(__filename);

const migration: Migration = {
	id: "v3-scores",
	up: async () => {
		// welp. here we go
		// we need to do a **mass** score migration

		for (const game of allSupportedGames) {
			logger.info(`Removing dangling scores for ${game}...`);

			const allChartIDs = (
				await db.anyCharts[game].find(
					{},
					{
						projection: { chartID: 1 },
					}
				)
			).map((e) => e.chartID);

			await DeleteMultipleScores(
				await db.scores.find({
					game,
					chartID: { $nin: allChartIDs },
				})
			);
		}

		await DeleteMultipleScores(await db.scores.find({ game: "itg" }));
		await DeleteMultipleScores(
			await db.scores.find({
				game: "popn",
				"scoreData.hitMeta": { $exists: true },
				$or: [
					{ "scoreData.hitMeta.specificClearType": { $exists: false } },
					{ "scoreData.hitMeta.specificClearType": null },
				],
			})
		);

		logger.info(`Starting score migration...`);

		const count = await db.scores.count({
			"scoreData.enumIndexes": { $exists: false },
		});

		logger.info(`Migrating ${count} scores.`);

		const failedScores = [];

		await EfficientDBIterate(
			db.scores,
			async (score) => {
				// @ts-expect-error just incase
				delete score._id;

				try {
					const gptString = GetGPTString(score.game, score.playtype);

					const newScore = {
						...score,
						scoreData: scoreMovers[gptString](
							score.scoreData as unknown as OldScoreData
						),
					};

					const newScoreID = CreateScoreID(
						gptString,
						newScore.userID,
						newScore,
						newScore.chartID
					);

					await monkDB.get("temp-update-map").insert({
						old: score.scoreID,
						new: newScoreID,
					});

					await UpdateScore(
						score,
						newScore,
						undefined,
						true, // skipUpdatingPBs because we'll do it after
						// all scores are guaranteeably correct.
						true // dangerously skip updating refs
						// as we're gonna do it ourselves
					);
				} catch (err) {
					logger.warn(err);
					logger.warn("Continuing through the error.");

					failedScores.push(score.scoreID);
				}
			},
			// no-op
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => void 0,
			{
				"scoreData.enumIndexes": { $exists: false },
			},
			10000
		);

		if (failedScores.length > 0) {
			throw new Error(
				`${failedScores.length} failed to be migrated. Resolve these manually, please.`
			);
		}

		logger.info(`Reconstructing PBs...`);

		await UpdateAllPBs();

		logger.info(`Re-calcing Game Profiles...`);
		await RecalcGameProfiles();

		// turn old integery classes into strings
		const profiles = await db["game-stats"].find({});

		for (const p of profiles) {
			const newClasses: Record<string, string | null> = {};

			for (const [key, value] of Object.entries(p.classes)) {
				if (value === null) {
					newClasses[key] = null;
					continue;
				}

				if (typeof value === "string") {
					newClasses[key] = value;
					continue;
				}

				const cVal = GetGamePTConfig(p.game, p.playtype).classes[key]!.values[value];

				if (!cVal) {
					logger.error(`No such class ${p.game} ${p.playtype} ${key} ${value}?`);
					newClasses[key] = value;
					continue;
				}

				newClasses[key] = cVal.id;
			}

			await db["game-stats"].update(
				{
					userID: p.userID,
					game: p.game,
					playtype: p.playtype,
				},
				{
					$set: {
						classes: newClasses,
						oldClasses: p.classes,
					},
				}
			);
		}

		const classAchievements = await db["class-achievements"].find({}, { projectID: true });

		for (const c of classAchievements) {
			const gptConfig = GetGamePTConfig(c.game, c.playtype);

			let newPreviousValue: string | null | undefined = c.classOldValue;

			if (typeof newPreviousValue === "number") {
				newPreviousValue =
					// @ts-expect-error hack, we know this type isn't what it
					// claims to be
					gptConfig.classes[c.classSet].values[c.classOldValue]?.id;
			}

			let newValue: string | undefined = c.classValue;

			if (typeof newValue === "number") {
				newValue = // @ts-expect-error hack, we know this type isn't what it
					// claims to be
					gptConfig.classes[c.classSet].values[c.classValue]?.id;
			}

			if (newPreviousValue === undefined) {
				logger.error(
					`OLD: No such class ${c.game} ${c.playtype} ${c.classSet} ${c.classOldValue}?`
				);
				continue;
			}

			if (newValue === undefined) {
				logger.error(
					`NEW: No such class ${c.game} ${c.playtype} ${c.classSet} ${c.classValue}?`
				);
				continue;
			}

			await db["class-achievements"].update(
				{
					_id: c._id,
				},
				{
					$set: {
						classOldValue: newPreviousValue,
						classValue: newValue,
					},
				}
			);
		}

		// somehow these sessions got corrupted, my bad.
		const corruptSessionsSomehow = await db.sessions.find({
			"scoreIDs.0": { $exists: false },
		});

		for (const ses of corruptSessionsSomehow) {
			await db.sessions.update(
				{ sessionID: ses.sessionID },
				{ $set: { scoreIDs: [ses.scoreIDs as unknown as string] } }
			);
		}

		logger.info(`Starting Ref Update`);

		await FastUpdateSessions();
		await FastUpdateImports();

		logger.info(`Finished Ref Update`);

		logger.info(`Re-calcing Sessions...`);
		await RecalcSessions();

		logger.info("Done!");
	},
	down: () => {
		throw new Error(`Reverting this change is not possible.`);
	},
};

async function FastUpdateSessions() {
	const sessions = await db.sessions.find({});

	await Promise.allSettled(
		sessions.map(async (session) => {
			if (session.scoreIDs.every((k) => k.startsWith("T"))) {
				return;
			}

			const newScoreIDRefs: Array<{ old: string; new: string }> = await monkDB
				.get("temp-update-map")
				.find({ old: { $in: session.scoreIDs } });

			const lookup = new Map<string, string>();

			for (const n of newScoreIDRefs) {
				lookup.set(n.old, n.new);
			}

			const newScoreIDs: Array<string> = [];

			for (const oldScoreID of session.scoreIDs) {
				// definitely new format
				if (oldScoreID.startsWith("T")) {
					newScoreIDs.push(oldScoreID);
					continue;
				}

				const newScoreID = lookup.get(oldScoreID);

				if (!newScoreID) {
					logger.warn(`No such scoreID ${oldScoreID} exists in lookup? Skipping score.`);
					continue;
				}

				newScoreIDs.push(newScoreID);
			}

			await db.sessions.update(
				{ sessionID: session.sessionID },
				{
					$set: { scoreIDs: newScoreIDs },
				}
			);
		})
	);
}

async function FastUpdateImports() {
	const sessions = await db.imports.find({});

	await Promise.allSettled(
		sessions.map(async (importDoc) => {
			if (importDoc.scoreIDs.every((k) => k.startsWith("T"))) {
				return;
			}

			const newScoreIDRefs: Array<{ old: string; new: string }> = await monkDB
				.get("temp-update-map")
				.find({ old: { $in: importDoc.scoreIDs } });

			const lookup = new Map<string, string>();

			for (const n of newScoreIDRefs) {
				lookup.set(n.old, n.new);
			}

			const newScoreIDs: Array<string> = [];

			for (const oldScoreID of importDoc.scoreIDs) {
				// definitely new format
				if (oldScoreID.startsWith("T")) {
					newScoreIDs.push(oldScoreID);
					continue;
				}

				const newScoreID = lookup.get(oldScoreID);

				if (!newScoreID) {
					logger.warn(`No such scoreID ${oldScoreID} exists in lookup? Skipping score.`);
					continue;
				}

				newScoreIDs.push(newScoreID);
			}

			await db.imports.update(
				{ importID: importDoc.importID },
				{
					$set: { scoreIDs: newScoreIDs },
				}
			);
		})
	);
}

export default migration;
