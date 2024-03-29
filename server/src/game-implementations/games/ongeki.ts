/* eslint-disable no-confusing-arrow */
import { GoalFmtScore, GoalOutOfFmtScore, GradeGoalFormatter } from "./_common";
import db from "external/mongo/db";
import { CreatePBMergeFor } from "game-implementations/utils/pb-merge";
import { ProfileAvgBestN } from "game-implementations/utils/profile-calc";
import { SessionAvgBest10For } from "game-implementations/utils/session-calc";
import { ONGEKIRating } from "rg-stats";
import { ONGEKI_GBOUNDARIES, FmtNum, GetGrade } from "tachi-common";
import { IsNullish } from "utils/misc";
import type { GPTServerImplementation } from "game-implementations/types";
import type { Difficulties, Game, Playtype, integer } from "tachi-common";

const CURRENT_VERSION = "bright MEMORY Act.3";

// basically the same as WACCA and mai DX.
const CalculateOngekiNaiveRate = async (game: Game, playtype: Playtype, userID: integer) => {
	const newChartIDs = (
		await db.charts.ongeki.find(
			{ "data.displayVersion": CURRENT_VERSION },
			{ projection: { chartID: 1 } }
		)
	).map((e) => e.chartID);

	const oldChartIDs = (
		await db.charts.ongeki.find(
			{ "data.displayVersion": { $ne: CURRENT_VERSION } },
			{ projection: { chartID: 1 } }
		)
	).map((e) => e.chartID);

	const best15New = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			isPrimary: true,
			chartID: { $in: newChartIDs },
			"calculatedData.rating": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rating": -1,
			},
			limit: 15,
			projection: {
				"calculatedData.rating": 1,
			},
		}
	);

	const best30Old = await db["personal-bests"].find(
		{
			game,
			playtype,
			userID,
			isPrimary: true,
			chartID: { $in: oldChartIDs },
			"calculatedData.rating": { $type: "number" },
		},
		{
			sort: {
				"calculatedData.rating": -1,
			},
			limit: 30,
			projection: {
				"calculatedData.rating": 1,
			},
		}
	);

	if (best15New.length + best30Old.length === 0) {
		return null;
	}

	return (
		(best15New.reduce((a, e) => a + (e.calculatedData.rating ?? 0), 0) +
			best30Old.reduce((a, e) => a + (e.calculatedData.rating ?? 0), 0)) /
		45
	);
};

export const OngekiPlatDiff = (diff: Difficulties["ongeki:Single"]) =>
	diff === "MASTER" || diff === "LUNATIC";

export const ONGEKI_IMPL: GPTServerImplementation<"ongeki:Single"> = {
	chartSpecificValidators: {
		platScore: (platScore, chart) => {
			if (!OngekiPlatDiff(chart.difficulty)) {
				// We don't care about other difficulties
				return true;
			}

			if (platScore < 0) {
				return `Platinum Score must be non-negative. Got ${platScore}`;
			}

			if (platScore > 2 * (chart.data.totalNoteCount ?? 0)) {
				return `Platinum Score is impossibly large. ${platScore} against ${chart.data.totalNoteCount} notes`;
			}

			return true;
		},
		bellCount: (bellCount, chart) => {
			if (bellCount < 0) {
				return `Bell Count must be non-negative. Got ${bellCount}`;
			}

			if (!chart.data.totalBellCount) {
				// Can't verify this data if we don't have it
				return true;
			}

			if (bellCount > chart.data.totalBellCount) {
				return `Bell Count is too large; ${bellCount} > ${chart.data.totalBellCount}`;
			}

			return true;
		},
		damage: (damage) => {
			if (damage < 0) {
				return `Damage must be non-negative. Got ${damage}`;
			}

			return true;
		},
		platDelta: (platDelta) => {
			if (platDelta > 0) {
				return `Plat Delta must be non-positive. Got ${platDelta}`;
			}

			return true;
		},
	},
	derivers: {
		grade: ({ score }) => GetGrade(ONGEKI_GBOUNDARIES, score),
		platDelta: ({ platScore }, chart) =>
			OngekiPlatDiff(chart.difficulty)
				? platScore - (chart.data.totalNoteCount ?? 0) * 2
				: -Number.MAX_SAFE_INTEGER,
	},
	scoreCalcs: {
		rating: (scoreData, chart) =>
			chart.data.unranked ? 0 : ONGEKIRating.calculate(scoreData.score, chart.levelNum),
	},
	sessionCalcs: { naiveRating: SessionAvgBest10For("rating") },
	profileCalcs: {
		lessNaiveRating: CalculateOngekiNaiveRate,
		naiveRating: ProfileAvgBestN("rating", 45),
	},
	classDerivers: {
		colour: (ratings) => {
			const rating = ratings.naiveRating;

			if (IsNullish(rating)) {
				return null;
			}

			if (rating >= 15) {
				return "RAINBOW";
			} else if (rating >= 14.5) {
				return "PLATINUM";
			} else if (rating >= 14) {
				return "GOLD";
			} else if (rating >= 13) {
				return "SILVER";
			} else if (rating >= 12) {
				return "COPPER";
			} else if (rating >= 10) {
				return "PURPLE";
			} else if (rating >= 7) {
				return "RED";
			} else if (rating >= 4) {
				return "ORANGE";
			} else if (rating >= 2) {
				return "GREEN";
			}

			return "BLUE";
		},
	},
	goalCriteriaFormatters: {
		score: GoalFmtScore,
		platScore: GoalFmtScore,
		platDelta: GoalFmtScore,
	},
	goalProgressFormatters: {
		grade: (pb, gradeIndex) =>
			GradeGoalFormatter(
				ONGEKI_GBOUNDARIES,
				pb.scoreData.grade,
				pb.scoreData.score,
				ONGEKI_GBOUNDARIES[gradeIndex]?.name ?? "D"
			),
		noteLamp: (pb) => pb.scoreData.noteLamp,
		bellLamp: (pb) => pb.scoreData.bellLamp,
		score: (pb) => FmtNum(pb.scoreData.score),
		platScore: (pb) => FmtNum(pb.scoreData.platScore),
		platDelta: (pb) => FmtNum(pb.scoreData.platDelta),
	},
	goalOutOfFormatters: {
		score: GoalOutOfFmtScore,
		platScore: GoalOutOfFmtScore,
		platDelta: GoalOutOfFmtScore,
	},
	pbMergeFunctions: [
		CreatePBMergeFor("largest", "platScore", "Best Platinum Score", (base, score) => {
			base.scoreData.platScore = score.scoreData.platScore;
			base.scoreData.platDelta = score.scoreData.platDelta;
		}),
		CreatePBMergeFor("largest", "enumIndexes.noteLamp", "Best Note Lamp", (base, score) => {
			base.scoreData.noteLamp = score.scoreData.noteLamp;
		}),
		CreatePBMergeFor("largest", "enumIndexes.bellLamp", "Best Bell Lamp", (base, score) => {
			base.scoreData.bellLamp = score.scoreData.bellLamp;
		}),
	],
	defaultMergeRefName: "Best Score",
	scoreValidators: [
		(s) => {
			let { hit, miss } = s.scoreData.judgements;

			hit ??= 0;
			miss ??= 0;

			if (s.scoreData.noteLamp === "ALL BREAK") {
				if (hit + miss > 0) {
					return "Cannot have an ALL BREAK if not all hits were justice or better.";
				}
			}

			if (s.scoreData.noteLamp === "FULL COMBO") {
				if (miss > 0) {
					return "Cannot have a FULL COMBO if the score has misses.";
				}
			}
		},
	],
};
